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
	userID := mux.Vars(r)["userId"]
	if userID == "" {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "userId is required", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Get all badges
	badgesCursor, err := db.BadgeCollection.Find(ctx, bson.M{})
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Failed to fetch badges", http.StatusInternalServerError)
		return
	}
	defer badgesCursor.Close(ctx)

	var badges []models.Badge
	if err := badgesCursor.All(ctx, &badges); err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Failed to decode badges", http.StatusInternalServerError)
		return
	}

	// Get user's badge progress
	userBadgesCursor, err := db.BadgeCollection.Find(
		ctx,
		bson.M{"userId": userID},
	)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Failed to fetch user badges", http.StatusInternalServerError)
		return
	}
	defer userBadgesCursor.Close(ctx)

	var userBadges []models.UserBadge
	if err := userBadgesCursor.All(ctx, &userBadges); err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Failed to decode user badges", http.StatusInternalServerError)
		return
	}

	// Create a map of badge progress for quick lookup
	badgeProgress := make(map[primitive.ObjectID]models.UserBadge)
	for _, ub := range userBadges {
		badgeProgress[ub.BadgeID] = ub
	}

	// Combine badges with progress
	var result []models.BadgeWithProgress
	for _, badge := range badges {
		progress := models.BadgeWithProgress{
			Badge:    badge,
			Earned:   false,
			Progress: 0,
		}

		if ub, exists := badgeProgress[badge.ID]; exists {
			progress.Earned = ub.Completed
			progress.Progress = ub.Progress
			progress.EarnedAt = &ub.EarnedAt
		}

		result = append(result, progress)
	}

	metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "200").Inc()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
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

	// Validate progress value
	if update.Progress < 0 || update.Progress > 100 {
		metrics.HTTPRequestsTotal.WithLabelValues("PUT", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "Progress must be between 0 and 100", http.StatusBadRequest)
		return
	}

	// Convert badgeID to ObjectID
	badgeObjID, err := primitive.ObjectIDFromHex(badgeID)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("PUT", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "Invalid badge ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Update or insert user badge progress
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

	// Convert badgeID to ObjectID
	badgeObjID, err := primitive.ObjectIDFromHex(badgeID)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "Invalid badge ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Get badge details
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

	// Get user's progress for this badge
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
	log.Printf("=== Starting badge progress update from quiz ===")

	// Get user from context
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	if claims == nil {
		log.Printf("❌ No claims found in context")
		http.Error(w, "No claims found", http.StatusUnauthorized)
		return
	}

	log.Printf("👤 Processing badge progress update for user %s", claims.UserID)

	// Parse request body
	var req struct {
		QuizResult models.QuizResultMeta `json:"quiz_result"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("❌ Error binding JSON for user %s: %v", claims.UserID, err)
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	log.Printf("📝 Received quiz result for user %s:", claims.UserID)
	log.Printf("   - Quiz ID: %s", req.QuizResult.QuizID.Hex())
	log.Printf("   - Quiz Title: %s", req.QuizResult.QuizTitle)
	log.Printf("   - Class ID: %s", req.QuizResult.ClassID.Hex())
	log.Printf("   - Score: %d/%d", req.QuizResult.Score, req.QuizResult.MaxScore)
	log.Printf("   - Perfect Score: %v", req.QuizResult.PerfectScore)
	log.Printf("   - Questions: %d correct, %d incorrect out of %d total",
		req.QuizResult.QuestionsCorrect,
		req.QuizResult.QuestionsIncorrect,
		req.QuizResult.QuestionsTotal)
	log.Printf("   - Difficulty: %s", req.QuizResult.DifficultyLevel)
	log.Printf("   - Performance: Accuracy=%.2f%%, Speed=%.2f, Consistency=%s",
		req.QuizResult.PerformanceMetrics.Accuracy,
		req.QuizResult.PerformanceMetrics.Speed,
		req.QuizResult.PerformanceMetrics.Consistency)

	// Calculate and update badge progress
	log.Printf("🔄 Starting badge progress calculation for user %s", claims.UserID)
	bc := controllers.NewBadgeController(db.BadgeCollection.Database())
	updatedBadges, err := bc.CheckAndUpdateBadges(r.Context(), claims.UserID, req.QuizResult)
	if err != nil {
		log.Printf("❌ Error updating badge progress for user %s: %v", claims.UserID, err)
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Failed to update badge progress", http.StatusInternalServerError)
		return
	}

	log.Printf("✅ Successfully updated badges for user %s:", claims.UserID)
	for _, badge := range updatedBadges {
		log.Printf("   - Badge %s: Progress=%.0f%%, Completed=%v",
			badge.BadgeID.Hex(), badge.Progress, badge.Completed)
	}

	log.Printf("=== Completed badge progress update for user %s ===", claims.UserID)
	metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "200").Inc()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(gin.H{"badges": updatedBadges})
}
