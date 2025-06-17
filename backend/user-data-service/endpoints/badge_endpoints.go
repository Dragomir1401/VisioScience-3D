package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"user-data-service/controllers"
	"user-data-service/metrics"
	"user-data-service/models"
	db "user-data-service/mongo"
	"user-data-service/utils"
)

type BadgeHandler struct {
	badgeController *controllers.BadgeController
}

func NewBadgeHandler(badgeController *controllers.BadgeController) *BadgeHandler {
	return &BadgeHandler{
		badgeController: badgeController,
	}
}

// GetUserBadges returns all badges with progress for a specific user
func GetUserBadges(w http.ResponseWriter, r *http.Request) {
	log.Printf("=== Starting GetUserBadges request ===")
	userID := mux.Vars(r)["userId"]
	if userID == "" {
		log.Printf(" No userId provided in request")
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "userId is required", http.StatusBadRequest)
		return
	}
	log.Printf("👤 Processing request for user ID: %s", userID)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	badgeController := controllers.NewBadgeController(db.UserCollection.Database())

	if err := badgeController.EnsureBadgesExist(ctx); err != nil {
		log.Printf("Error ensuring badges exist: %v", err)
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Failed to ensure badges exist", http.StatusInternalServerError)
		return
	}

	log.Printf(" Fetching all badges from database...")
	badges, err := badgeController.GetAllBadges()
	if err != nil {
		log.Printf(" Error fetching badges: %v", err)
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Failed to fetch badges", http.StatusInternalServerError)
		return
	}
	log.Printf(" Found %d badges in system", len(badges))
	for _, badge := range badges {
		log.Printf("   - Badge: %s (Type: %s)", badge.Title, badge.Type)
	}

	log.Printf(" Fetching badge progress for user %s...", userID)
	cursor, err := db.UserCollection.Database().Collection("user_badges").Find(ctx, bson.M{"user_id": userID})
	if err != nil {
		log.Printf(" Error fetching user badges: %v", err)
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Failed to fetch user badges", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var userBadges []models.UserBadge
	if err := cursor.All(ctx, &userBadges); err != nil {
		log.Printf("Error decoding user badges: %v", err)
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Failed to decode user badges", http.StatusInternalServerError)
		return
	}
	log.Printf(" Found %d badges for user %s", len(userBadges), userID)
	for _, badge := range userBadges {
		log.Printf("   - User Badge: ID=%s, Progress=%.0f%%, Completed=%v, UpdatedAt=%v",
			badge.BadgeID.Hex(), badge.Progress, badge.Completed, badge.UpdatedAt)
	}

	userBadgeMap := make(map[string]models.UserBadge)
	for _, badge := range userBadges {
		userBadgeMap[badge.BadgeID.Hex()] = badge
	}

	log.Printf("Combining badges with user progress...")
	var badgesWithProgress []models.BadgeWithProgress
	for _, badge := range badges {
		userBadge, exists := userBadgeMap[badge.ID.Hex()]
		if !exists {
			userBadge = models.UserBadge{
				UserID:    userID,
				BadgeID:   badge.ID,
				Progress:  0,
				Completed: false,
				UpdatedAt: time.Now(),
			}
		}
		badgesWithProgress = append(badgesWithProgress, models.BadgeWithProgress{
			Badge:    badge,
			Earned:   userBadge.Completed,
			Progress: userBadge.Progress,
			EarnedAt: &userBadge.EarnedAt,
		})
	}

	log.Printf("=== Completed GetUserBadges request for user %s ===", userID)
	log.Printf(" Returning %d badges with progress", len(badgesWithProgress))

	metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "200").Inc()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(badgesWithProgress)
}

// UpdateBadgeProgress updates the progress of a badge for a user
func UpdateBadgeProgress(w http.ResponseWriter, r *http.Request) {
	userID := mux.Vars(r)["userId"]
	badgeID := mux.Vars(r)["badgeId"]

	var update struct {
		Progress float64 `json:"progress"`
	}
	if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("PUT", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if update.Progress < 0 || update.Progress > 100 {
		metrics.HTTPRequestsTotal.WithLabelValues("PUT", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "Progress must be between 0 and 100", http.StatusBadRequest)
		return
	}

	badgeObjID, err := primitive.ObjectIDFromHex(badgeID)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("PUT", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "Invalid badge ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	opts := options.Update().SetUpsert(true)
	filter := bson.M{
		"userId":  userID,
		"badgeId": badgeObjID,
	}
	updateDoc := bson.M{
		"$set": bson.M{
			"progress":  update.Progress,
			"completed": update.Progress >= 100,
			"updatedAt": time.Now(),
		},
		"$setOnInsert": bson.M{
			"earnedAt": time.Now(),
		},
	}

	_, err = db.BadgeCollection.UpdateOne(
		ctx,
		filter,
		updateDoc,
		opts,
	)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("PUT", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Failed to update badge progress", http.StatusInternalServerError)
		return
	}

	metrics.HTTPRequestsTotal.WithLabelValues("PUT", utils.NormalizePath(r.URL.Path), "200").Inc()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Badge progress updated successfully"})
}

// GetBadgeDetails returns detailed information about a specific badge
func GetBadgeDetails(w http.ResponseWriter, r *http.Request) {
	badgeID := mux.Vars(r)["badgeId"]
	userID := mux.Vars(r)["userId"]

	badgeObjID, err := primitive.ObjectIDFromHex(badgeID)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "Invalid badge ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var badge models.Badge
	err = db.BadgeCollection.FindOne(
		ctx,
		bson.M{"_id": badgeObjID},
	).Decode(&badge)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "404").Inc()
			http.Error(w, "Badge not found", http.StatusNotFound)
			return
		}
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Failed to fetch badge details", http.StatusInternalServerError)
		return
	}

	var userBadge models.UserBadge
	err = db.BadgeCollection.FindOne(
		ctx,
		bson.M{
			"userId":  userID,
			"badgeId": badgeObjID,
		},
	).Decode(&userBadge)

	result := models.BadgeWithProgress{
		Badge:    badge,
		Earned:   false,
		Progress: 0,
	}

	if err == nil {
		result.Earned = userBadge.Completed
		result.Progress = userBadge.Progress
		result.EarnedAt = &userBadge.EarnedAt
	}

	metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "200").Inc()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// UpdateBadgeProgressFromQuiz updates badge progress based on quiz results
func UpdateBadgeProgressFromQuiz(w http.ResponseWriter, r *http.Request) {
	log.Printf("\n=== Starting badge progress update from quiz ===")

	claims := r.Context().Value("claims").(*utils.CustomClaims)
	if claims == nil {
		log.Printf(" No claims found in context")
		http.Error(w, "No claims found", http.StatusUnauthorized)
		return
	}

	log.Printf("👤 Processing badge progress update for user %s", claims.UserID)

	var req struct {
		QuizResult models.QuizResultMeta `json:"quiz_result"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf(" Error binding JSON for user %s: %v", claims.UserID, err)
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	log.Printf(" Received quiz result for user %s:", claims.UserID)
	log.Printf("   - Quiz ID: %s", req.QuizResult.QuizID.Hex())
	log.Printf("   - Quiz Title: %s", req.QuizResult.QuizTitle)
	log.Printf("   - Score: %d/%d (%.2f%%)",
		req.QuizResult.Score,
		req.QuizResult.MaxScore,
		float64(req.QuizResult.Score)/float64(req.QuizResult.MaxScore)*100)
	log.Printf("   - Perfect Score: %v", req.QuizResult.PerfectScore)
	log.Printf("   - Questions: %d correct, %d incorrect out of %d total",
		req.QuizResult.QuestionsCorrect,
		req.QuizResult.QuestionsIncorrect,
		req.QuizResult.QuestionsTotal)
	log.Printf("   - Difficulty: %s", req.QuizResult.DifficultyLevel)

	log.Printf("🔧 Initializing badge controller...")
	bc := controllers.NewBadgeController(db.MongoClient.Database("userdata"))

	log.Printf(" Ensuring all badges exist in the system...")
	if err := bc.EnsureBadgesExist(r.Context()); err != nil {
		log.Printf(" Error ensuring badges exist: %v", err)
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Failed to ensure badges exist", http.StatusInternalServerError)
		return
	}
	log.Printf(" All badges verified in system")

	log.Printf(" Starting badge progress calculation for user %s", claims.UserID)
	updatedBadges, err := bc.CheckAndUpdateBadges(r.Context(), claims.UserID, req.QuizResult)
	if err != nil {
		log.Printf(" Error updating badge progress for user %s: %v", claims.UserID, err)
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Failed to update badge progress", http.StatusInternalServerError)
		return
	}

	log.Printf(" Successfully updated badges for user %s:", claims.UserID)
	if len(updatedBadges) == 0 {
		log.Printf("  No badges were updated")
	} else {
		for _, badge := range updatedBadges {
			log.Printf("   - Badge %s:", badge.BadgeID.Hex())
			log.Printf("     Progress: %.0f%%", badge.Progress)
			log.Printf("     Completed: %v", badge.Completed)
			log.Printf("     Updated At: %v", badge.UpdatedAt)
		}
	}

	log.Printf("=== Completed badge progress update for user %s ===\n", claims.UserID)
	metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "200").Inc()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(gin.H{"badges": updatedBadges})
}
