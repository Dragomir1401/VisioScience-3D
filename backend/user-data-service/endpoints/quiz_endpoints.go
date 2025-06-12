package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"

	"user-data-service/models"
	db "user-data-service/mongo"

	"user-data-service/metrics"
	"user-data-service/utils"
)

// calculatePoints calculates points based on quiz score and other factors
func calculatePoints(score int, maxScore int) int64 {
	// Base points calculation (can be adjusted based on your needs)
	basePoints := int64(float64(score) / float64(maxScore) * 100)

	// Bonus points for perfect scores
	if score == maxScore {
		basePoints += 50
	}

	return basePoints
}

// updateUserRankings updates the user's class and global rankings
func updateUserRankings(ctx context.Context, userID primitive.ObjectID) error {
	// Update class ranking
	_, err := db.UserCollection.UpdateMany(
		ctx,
		bson.M{"classes": bson.M{"$in": []primitive.ObjectID{userID}}},
		bson.M{"$set": bson.M{"class_ranking": 0}}, // Reset rankings
	)
	if err != nil {
		return err
	}

	// Update global ranking
	_, err = db.UserCollection.UpdateMany(
		ctx,
		bson.M{},
		bson.M{"$set": bson.M{"global_ranking": 0}}, // Reset rankings
	)
	if err != nil {
		return err
	}

	// Update class rankings
	cursor, err := db.UserCollection.Find(ctx, bson.M{})
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)

	var users []models.User
	if err = cursor.All(ctx, &users); err != nil {
		return err
	}

	// Group users by class and sort by points
	classPoints := make(map[primitive.ObjectID][]struct {
		UserID primitive.ObjectID
		Points int64
	})

	for _, user := range users {
		for _, classID := range user.Classes {
			classPoints[classID] = append(classPoints[classID], struct {
				UserID primitive.ObjectID
				Points int64
			}{user.ID, user.TotalPoints})
		}
	}

	// Update rankings for each class
	for classID, points := range classPoints {
		// Sort by points
		for i := 0; i < len(points); i++ {
			for j := i + 1; j < len(points); j++ {
				if points[i].Points < points[j].Points {
					points[i], points[j] = points[j], points[i]
				}
			}
		}

		// Update rankings
		for i, p := range points {
			_, err = db.UserCollection.UpdateOne(
				ctx,
				bson.M{"_id": p.UserID, "classes": classID},
				bson.M{"$set": bson.M{"class_ranking": i + 1}},
			)
			if err != nil {
				return err
			}
		}
	}

	// Update global rankings
	// Sort all users by points
	var allUsers []struct {
		ID     primitive.ObjectID
		Points int64
	}
	for _, user := range users {
		allUsers = append(allUsers, struct {
			ID     primitive.ObjectID
			Points int64
		}{user.ID, user.TotalPoints})
	}

	// Sort by points
	for i := 0; i < len(allUsers); i++ {
		for j := i + 1; j < len(allUsers); j++ {
			if allUsers[i].Points < allUsers[j].Points {
				allUsers[i], allUsers[j] = allUsers[j], allUsers[i]
			}
		}
	}

	// Update global rankings
	for i, u := range allUsers {
		_, err = db.UserCollection.UpdateOne(
			ctx,
			bson.M{"_id": u.ID},
			bson.M{"$set": bson.M{"global_ranking": i + 1}},
		)
		if err != nil {
			return err
		}
	}

	return nil
}

// POST /user/quiz/result
func SubmitUserQuizResult(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	userOID, err := primitive.ObjectIDFromHex(claims.UserID)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	var req struct {
		QuizID   string `json:"quiz_id"`
		Score    int    `json:"score"`
		MaxScore int    `json:"max_score"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "Bad payload", http.StatusBadRequest)
		return
	}
	quizOID, err := primitive.ObjectIDFromHex(req.QuizID)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
		return
	}

	// Calculate points
	points := calculatePoints(req.Score, req.MaxScore)
	now := time.Now()

	meta := models.QuizResultMeta{
		QuizID:    quizOID,
		Score:     req.Score,
		Points:    points,
		Timestamp: now,
	}

	pointsEntry := models.PointsEntry{
		Points:      points,
		Source:      "quiz",
		SourceID:    req.QuizID,
		Description: "Points earned from quiz completion",
		Timestamp:   now,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Update user with quiz result and points
	_, err = db.UserCollection.UpdateOne(
		ctx,
		bson.M{"_id": userOID},
		bson.M{
			"$push": bson.M{
				"quiz_results":   meta,
				"points_history": pointsEntry,
			},
			"$inc": bson.M{"total_points": points},
		},
	)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "DB error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Update rankings
	if err := updateUserRankings(ctx, userOID); err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Failed to update rankings: "+err.Error(), http.StatusInternalServerError)
		return
	}

	metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "201").Inc()
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Result saved",
		"points":  points,
	})
}

// GET /user/quiz/results/{quizId}
func GetUserQuizResult(w http.ResponseWriter, r *http.Request) {
	quizOID, err := primitive.ObjectIDFromHex(mux.Vars(r)["quizId"])
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", "/user/quiz/results/{quizId}", "400").Inc()
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
		return
	}

	claims := r.Context().Value("claims").(*utils.CustomClaims)
	userOID, _ := primitive.ObjectIDFromHex(claims.UserID)

	var user models.User
	if err := db.UserCollection.FindOne(
		r.Context(),
		bson.M{"_id": userOID, "quiz_results.quiz_id": quizOID},
	).Decode(&user); err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", "/user/quiz/results/{quizId}", "404").Inc()
		w.WriteHeader(http.StatusNotFound)
		return
	}

	var last models.QuizResultMeta
	for _, qr := range user.QuizResults {
		if qr.QuizID == quizOID && (last.Timestamp.IsZero() || qr.Timestamp.After(last.Timestamp)) {
			last = qr
		}
	}

	metrics.HTTPRequestsTotal.WithLabelValues("GET", "/user/quiz/results/{quizId}", "200").Inc()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(last)
}

// GET /user/leaderboard
func GetLeaderboard(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Get query parameters
	classID := r.URL.Query().Get("class_id")
	limit := 10 // Default limit

	// Build query
	query := bson.M{}
	if classID != "" {
		classOID, err := primitive.ObjectIDFromHex(classID)
		if err != nil {
			metrics.HTTPRequestsTotal.WithLabelValues("GET", "/user/leaderboard", "400").Inc()
			http.Error(w, "Invalid class ID", http.StatusBadRequest)
			return
		}
		query["classes"] = classOID
	}

	// Find users and sort by total points
	cursor, err := db.UserCollection.Find(
		ctx,
		query,
		options.Find().SetSort(bson.M{"total_points": -1}).SetLimit(int64(limit)),
	)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", "/user/leaderboard", "500").Inc()
		http.Error(w, "Failed to fetch leaderboard", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var users []models.User
	if err = cursor.All(ctx, &users); err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", "/user/leaderboard", "500").Inc()
		http.Error(w, "Failed to decode users", http.StatusInternalServerError)
		return
	}

	// Prepare response
	type LeaderboardEntry struct {
		UserID      primitive.ObjectID `json:"user_id"`
		Email       string             `json:"email"`
		TotalPoints int64              `json:"total_points"`
		Ranking     int                `json:"ranking"`
		Badges      []models.Badge     `json:"badges"`
	}

	var entries []LeaderboardEntry
	for i, user := range users {
		entries = append(entries, LeaderboardEntry{
			UserID:      user.ID,
			Email:       user.Email,
			TotalPoints: user.TotalPoints,
			Ranking:     i + 1,
			Badges:      user.Badges,
		})
	}

	metrics.HTTPRequestsTotal.WithLabelValues("GET", "/user/leaderboard", "200").Inc()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(entries)
}
