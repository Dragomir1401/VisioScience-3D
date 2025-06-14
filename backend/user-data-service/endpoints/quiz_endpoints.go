package handlers

import (
	"context"
	"encoding/json"
	"log"
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
func calculatePoints(score int, maxScore int, timeBonus int, streakBonus int, perfectBonus int) int64 {
	// Safety check for maxScore
	if maxScore <= 0 {
		maxScore = 1 // Prevent division by zero
	}

	// Calculate base points (percentage of max score)
	// Using float64 for more precise calculation
	basePoints := float64(score) / float64(maxScore) * 100

	// Convert bonuses to int64 and add them
	var totalPoints int64
	totalPoints = int64(basePoints) + int64(timeBonus) + int64(streakBonus) + int64(perfectBonus)

	// Safety check for negative values
	if totalPoints < 0 {
		totalPoints = 0
	}

	// Safety check for maximum value
	const maxInt64 = int64(^uint64(0) >> 1) // Maximum value for int64
	if totalPoints > maxInt64 {
		totalPoints = maxInt64
	}

	return totalPoints
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

type QuizResultRequest struct {
	QuizID             string `json:"quiz_id"`
	Score              int    `json:"score"`
	MaxScore           int    `json:"max_score"`
	TimeTaken          int    `json:"time_taken"`
	PerfectScore       bool   `json:"perfect_score"`
	QuestionsTotal     int    `json:"questions_total"`
	QuestionsCorrect   int    `json:"questions_correct"`
	QuestionsIncorrect int    `json:"questions_incorrect"`
	DifficultyLevel    string `json:"difficulty_level"`
	CompletionTime     int    `json:"completion_time"`
	StreakBonus        int    `json:"streak_bonus"`
	TimeBonus          int    `json:"time_bonus"`
	PerfectBonus       int    `json:"perfect_bonus"`
	TotalPoints        int    `json:"total_points"`
	ClassID            string `json:"class_id"`
	QuizTitle          string `json:"quiz_title"`
	QuizType           string `json:"quiz_type"`
	AttemptNumber      int    `json:"attempt_number"`
	CompletionDate     string `json:"completion_date"`
	PerformanceMetrics struct {
		Accuracy    float64 `json:"accuracy"`
		Speed       float64 `json:"speed"`
		Consistency string  `json:"consistency"`
	} `json:"performance_metrics"`
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

	var req QuizResultRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "Bad payload", http.StatusBadRequest)
		return
	}

	// Validate input values
	if req.Score < 0 || req.MaxScore < 0 || req.TimeBonus < 0 || req.StreakBonus < 0 || req.PerfectBonus < 0 {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "Invalid negative values in request", http.StatusBadRequest)
		return
	}

	quizOID, err := primitive.ObjectIDFromHex(req.QuizID)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
		return
	}

	classOID, err := primitive.ObjectIDFromHex(req.ClassID)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "Invalid class ID", http.StatusBadRequest)
		return
	}

	// Calculate points with safety checks
	points := calculatePoints(req.Score, req.MaxScore, req.TimeBonus, req.StreakBonus, req.PerfectBonus)
	now := time.Now()

	meta := models.QuizResultMeta{
		QuizID:             quizOID,
		ClassID:            classOID,
		Score:              req.Score,
		MaxScore:           req.MaxScore,
		Points:             points,
		Timestamp:          now,
		TimeTaken:          req.TimeTaken,
		PerfectScore:       req.PerfectScore,
		QuestionsTotal:     req.QuestionsTotal,
		QuestionsCorrect:   req.QuestionsCorrect,
		QuestionsIncorrect: req.QuestionsIncorrect,
		DifficultyLevel:    req.DifficultyLevel,
		CompletionTime:     req.CompletionTime,
		StreakBonus:        req.StreakBonus,
		TimeBonus:          req.TimeBonus,
		PerfectBonus:       req.PerfectBonus,
		QuizTitle:          req.QuizTitle,
		QuizType:           req.QuizType,
		AttemptNumber:      req.AttemptNumber,
		CompletionDate:     req.CompletionDate,
		PerformanceMetrics: models.PerformanceMetrics{
			Accuracy:    req.PerformanceMetrics.Accuracy,
			Speed:       req.PerformanceMetrics.Speed,
			Consistency: req.PerformanceMetrics.Consistency,
		},
	}

	log.Printf("SubmitUserQuizResult: Attempting to save meta object with MaxScore: %d, QuizID: %s, Score: %d", meta.MaxScore, meta.QuizID.Hex(), meta.Score)

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

	// Fetch the updated user document to inspect the saved quiz result
	var updatedUser models.User
	err = db.UserCollection.FindOne(ctx, bson.M{"_id": userOID}).Decode(&updatedUser)
	if err != nil {
		log.Printf("Error fetching updated user for logging: %v", err)
	} else {
		// Find the newly added quiz result
		for _, qr := range updatedUser.QuizResults {
			if qr.QuizID == quizOID && qr.Timestamp.Equal(now) { // Assuming timestamp is unique enough for this log
				log.Printf("Successfully saved QuizResultMeta with MaxScore: %d for QuizID: %s", qr.MaxScore, qr.QuizID.Hex())
				break
			}
		}
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
		"meta":    meta,
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
