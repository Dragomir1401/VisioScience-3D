package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sort"
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
	QuizID                       string   `json:"quiz_id"`
	Score                        int      `json:"score"`
	MaxScore                     int      `json:"max_score"`
	TimeTaken                    int      `json:"time_taken"`
	PerfectScore                 bool     `json:"perfect_score"`
	QuestionsTotal               int      `json:"questions_total"`
	QuestionsCorrect             int      `json:"questions_correct"`
	QuestionsIncorrect           int      `json:"questions_incorrect"`
	DifficultyLevel              string   `json:"difficulty_level"`
	CompletionTime               int      `json:"completion_time"`
	StreakBonus                  int      `json:"streak_bonus"`
	TimeBonus                    int      `json:"time_bonus"`
	PerfectBonus                 int      `json:"perfect_bonus"`
	TotalPoints                  int      `json:"total_points"`
	ClassID                      string   `json:"class_id"`
	QuizTitle                    string   `json:"quiz_title"`
	QuizType                     string   `json:"quiz_type"`
	AttemptNumber                int      `json:"attempt_number"`
	CompletionDate               string   `json:"completion_date"`
	IncorrectlyAnsweredQuestions []string `json:"incorrectly_answered_questions"`
	PerformanceMetrics           struct {
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

	// Validate required fields
	if req.QuizTitle == "" {
		log.Printf("SubmitUserQuizResult: Warning - Empty quiz title received for quiz ID: %s", req.QuizID)
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "Quiz title is required", http.StatusBadRequest)
		return
	}

	if req.DifficultyLevel == "" {
		log.Printf("SubmitUserQuizResult: Warning - Empty difficulty level received for quiz ID: %s", req.QuizID)
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "Difficulty level is required", http.StatusBadRequest)
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

	// Convert incorrectly answered questions from string IDs to ObjectID
	var incorrectQuestionOIDs []primitive.ObjectID
	for _, qid := range req.IncorrectlyAnsweredQuestions {
		oid, err := primitive.ObjectIDFromHex(qid)
		if err != nil {
			log.Printf("Warning: Invalid question ID in request: %s, error: %v", qid, err)
			continue
		}
		incorrectQuestionOIDs = append(incorrectQuestionOIDs, oid)
	}

	log.Printf("SubmitUserQuizResult: Incorrectly answered questions: %v", incorrectQuestionOIDs)

	// Calculate points with safety checks
	points := calculatePoints(req.Score, req.MaxScore, req.TimeBonus, req.StreakBonus, req.PerfectBonus)
	now := time.Now()

	meta := models.QuizResultMeta{
		QuizID:                       quizOID,
		ClassID:                      classOID,
		Score:                        req.Score,
		MaxScore:                     req.MaxScore,
		Points:                       points,
		Timestamp:                    now,
		TimeTaken:                    req.TimeTaken,
		PerfectScore:                 req.PerfectScore,
		QuestionsTotal:               req.QuestionsTotal,
		QuestionsCorrect:             req.QuestionsCorrect,
		QuestionsIncorrect:           req.QuestionsIncorrect,
		DifficultyLevel:              req.DifficultyLevel,
		CompletionTime:               req.CompletionTime,
		StreakBonus:                  req.StreakBonus,
		TimeBonus:                    req.TimeBonus,
		PerfectBonus:                 req.PerfectBonus,
		QuizTitle:                    req.QuizTitle,
		QuizType:                     req.QuizType,
		AttemptNumber:                req.AttemptNumber,
		CompletionDate:               req.CompletionDate,
		IncorrectlyAnsweredQuestions: incorrectQuestionOIDs,
		PerformanceMetrics: models.PerformanceMetrics{
			Accuracy:    req.PerformanceMetrics.Accuracy,
			Speed:       req.PerformanceMetrics.Speed,
			Consistency: req.PerformanceMetrics.Consistency,
		},
	}

	log.Printf("SubmitUserQuizResult: Saving quiz result - QuizID: %s, Title: %s, Score: %d/%d, Difficulty: %s",
		meta.QuizID.Hex(), meta.QuizTitle, meta.Score, meta.MaxScore, meta.DifficultyLevel)

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

	// Fetch the updated user document to verify the save
	var updatedUser models.User
	err = db.UserCollection.FindOne(ctx, bson.M{"_id": userOID}).Decode(&updatedUser)
	if err != nil {
		log.Printf("Error fetching updated user for verification: %v", err)
	} else {
		// Find the newly added quiz result
		for _, qr := range updatedUser.QuizResults {
			if qr.QuizID == quizOID && qr.Timestamp.Equal(now) {
				log.Printf("Successfully saved QuizResultMeta - QuizID: %s, Title: %s, Score: %d/%d, Difficulty: %s",
					qr.QuizID.Hex(), qr.QuizTitle, qr.Score, qr.MaxScore, qr.DifficultyLevel)
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

func containsInt(slice []int, val int) bool {
	for _, item := range slice {
		if item == val {
			return true
		}
	}
	return false
}

type QuizStats struct {
	ID                   primitive.ObjectID `json:"id"`
	Title                string             `json:"title"`
	Completed            int                `json:"completed"`
	Avg                  float64            `json:"avg"`
	Difficulty           string             `json:"difficulty"`
	TotalUsers           int                `json:"total_users"`
	InProgress           int                `json:"in_progress"`
	NotStarted           int                `json:"not_started"`
	ChallengingQuestions []struct {
		Question      string  `json:"question"`
		IncorrectRate float64 `json:"incorrect_rate"`
	} `json:"challenging_questions"`
}

// GET /user/quiz/statistics
func GetQuizStatistics(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	if claims.Role != string(models.RoleTeacher) && claims.Role != string(models.RoleAdmin) {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "403").Inc()
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get all users
	cursor, err := db.UserCollection.Find(ctx, bson.M{})
	if err != nil {
		log.Printf("GetQuizStatistics: Error fetching users: %v", err)
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Failed to fetch users", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var users []models.User
	if err := cursor.All(ctx, &users); err != nil {
		log.Printf("GetQuizStatistics: Error decoding users: %v", err)
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Failed to decode users", http.StatusInternalServerError)
		return
	}

	// Map to store quiz statistics
	quizStats := make(map[string]*QuizStats)

	// Process each user's quiz results
	for _, user := range users {
		for _, qr := range user.QuizResults {
			if qr.QuizTitle == "" {
				log.Printf("GetQuizStatistics: Skipping quiz result with empty title for user %s", user.Email)
				continue
			}

			quizID := qr.QuizID.Hex()
			stats, exists := quizStats[quizID]
			if !exists {
				stats = &QuizStats{
					ID:         qr.QuizID,
					Title:      qr.QuizTitle,
					Avg:        0,
					Difficulty: qr.DifficultyLevel,
				}
				quizStats[quizID] = stats
			}

			if qr.MaxScore > 0 {
				scorePercentage := float64(qr.Score) / float64(qr.MaxScore) * 100
				stats.Avg = (stats.Avg*float64(stats.Completed) + scorePercentage) / float64(stats.Completed+1)
				stats.Completed++
			}
		}
	}

	// Convert map to slice and filter out quizzes with empty titles
	var statsList []QuizStats
	for _, stats := range quizStats {
		if stats.Title != "" {
			statsList = append(statsList, *stats)
		}
	}

	// Sort by title
	sort.Slice(statsList, func(i, j int) bool {
		return statsList[i].Title < statsList[j].Title
	})

	log.Printf("GetQuizStatistics: Returning %d valid quiz statistics", len(statsList))
	metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "200").Inc()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(statsList)
}

// GET /user/quiz/{quizId}/challenging-questions
func GetChallengingQuestions(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	if claims.Role != string(models.RoleTeacher) && claims.Role != string(models.RoleAdmin) {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "403").Inc()
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	quizID := mux.Vars(r)["quizId"]
	log.Printf("GetChallengingQuestions: Received request with quiz ID from URL: %s", quizID)

	quizOID, err := primitive.ObjectIDFromHex(quizID)
	if err != nil {
		log.Printf("GetChallengingQuestions: Invalid quiz ID format: %s", quizID)
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
		return
	}
	log.Printf("GetChallengingQuestions: Successfully converted quiz ID to ObjectID: %s", quizOID.Hex())

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get all users who attempted this quiz
	cursor, err := db.UserCollection.Find(ctx, bson.M{
		"quiz_results": bson.M{
			"$elemMatch": bson.M{
				"quiz_id": quizOID,
			},
		},
	}, options.Find().SetProjection(bson.M{
		"quiz_results": 1, // Include the entire quiz_results array
	}))
	if err != nil {
		log.Printf("GetChallengingQuestions: Error fetching users: %v", err)
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Failed to fetch users", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var users []models.User
	if err := cursor.All(ctx, &users); err != nil {
		log.Printf("GetChallengingQuestions: Error decoding users: %v", err)
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Failed to decode users", http.StatusInternalServerError)
		return
	}
	log.Printf("GetChallengingQuestions: Found %d users who attempted quiz %s", len(users), quizOID.Hex())

	// Map to store question statistics
	questionStats := make(map[primitive.ObjectID]struct {
		TotalAttempts     int
		IncorrectAttempts int
		QuestionText      string
	})

	// Create a custom HTTP client with timeout and transport settings
	client := &http.Client{
		Timeout: 5 * time.Second,
		Transport: &http.Transport{
			MaxIdleConns:        100,
			MaxIdleConnsPerHost: 100,
			IdleConnTimeout:     90 * time.Second,
		},
	}

	// Get question details from evaluation service
	var quizData struct {
		Questions []struct {
			ID   primitive.ObjectID `json:"id"`
			Text string             `json:"text"`
		} `json:"questions"`
	}

	maxRetries := 3
	for retry := 0; retry < maxRetries; retry++ {
		evalURL := fmt.Sprintf("%s/evaluation/quiz/%s", utils.GetEnv("EVAL_SERVICE_URL", "http://localhost:8000"), quizOID.Hex())
		log.Printf("GetChallengingQuestions: Attempting to fetch quiz data from %s (attempt %d/%d)", evalURL, retry+1, maxRetries)

		reqEval, err := http.NewRequestWithContext(ctx, "GET", evalURL, nil)
		if err != nil {
			log.Printf("GetChallengingQuestions: Error creating request to evaluation service: %v", err)
			continue
		}
		reqEval.Header.Set("Authorization", r.Header.Get("Authorization"))

		respEval, err := client.Do(reqEval)
		if err != nil {
			log.Printf("GetChallengingQuestions: Error contacting evaluation service (attempt %d/%d): %v", retry+1, maxRetries, err)
			if retry < maxRetries-1 {
				backoff := time.Duration(retry+1) * time.Second
				log.Printf("GetChallengingQuestions: Retrying in %v...", backoff)
				time.Sleep(backoff)
				continue
			}
			break
		}
		defer respEval.Body.Close()

		if respEval.StatusCode != http.StatusOK {
			log.Printf("GetChallengingQuestions: Evaluation service returned status %d (attempt %d/%d)", respEval.StatusCode, retry+1, maxRetries)
			if retry < maxRetries-1 {
				backoff := time.Duration(retry+1) * time.Second
				log.Printf("GetChallengingQuestions: Retrying in %v...", backoff)
				time.Sleep(backoff)
				continue
			}
			break
		}

		if err := json.NewDecoder(respEval.Body).Decode(&quizData); err != nil {
			log.Printf("GetChallengingQuestions: Error decoding quiz data: %v", err)
			break
		}

		log.Printf("GetChallengingQuestions: Successfully fetched quiz data with %d questions", len(quizData.Questions))
		break
	}

	// Initialize question stats with text from quiz data
	for _, q := range quizData.Questions {
		questionStats[q.ID] = struct {
			TotalAttempts     int
			IncorrectAttempts int
			QuestionText      string
		}{
			QuestionText: q.Text,
		}
	}

	// Process each user's quiz results
	for _, user := range users {
		log.Printf("GetChallengingQuestions: Processing user %s", user.ID.Hex())
		for _, qr := range user.QuizResults {
			if qr.QuizID != quizOID {
				continue
			}

			log.Printf("GetChallengingQuestions: Processing quiz result - User: %s, Timestamp: %v, Score: %d/%d",
				user.ID.Hex(), qr.Timestamp, qr.Score, qr.MaxScore)

			// Log the raw incorrectly answered questions array
			if qr.IncorrectlyAnsweredQuestions == nil {
				log.Printf("GetChallengingQuestions: IncorrectlyAnsweredQuestions is nil for attempt at %v", qr.Timestamp)
			} else if len(qr.IncorrectlyAnsweredQuestions) == 0 {
				log.Printf("GetChallengingQuestions: IncorrectlyAnsweredQuestions is empty for attempt at %v (Score: %d/%d)",
					qr.Timestamp, qr.Score, qr.MaxScore)
			} else {
				log.Printf("GetChallengingQuestions: Found %d incorrectly answered questions for attempt at %v (Score: %d/%d): %v",
					len(qr.IncorrectlyAnsweredQuestions), qr.Timestamp, qr.Score, qr.MaxScore, qr.IncorrectlyAnsweredQuestions)
			}

			// Get all questions that were attempted in this attempt
			attemptedQuestions := make(map[primitive.ObjectID]bool)
			for _, q := range quizData.Questions {
				attemptedQuestions[q.ID] = true
				log.Printf("GetChallengingQuestions: Question available in quiz: ID=%s, Text=%s", q.ID.Hex(), q.Text)
			}

			// Log current stats before updates
			for qid, stats := range questionStats {
				log.Printf("GetChallengingQuestions: Before update - Question ID %s (text: %s): TotalAttempts=%d, IncorrectAttempts=%d",
					qid.Hex(), stats.QuestionText, stats.TotalAttempts, stats.IncorrectAttempts)
			}

			// Increment total attempts only for questions that were attempted
			for qid := range attemptedQuestions {
				if stats, exists := questionStats[qid]; exists {
					stats.TotalAttempts++
					questionStats[qid] = stats
					log.Printf("GetChallengingQuestions: Incremented TotalAttempts for question ID %s (text: %s): %d",
						qid.Hex(), stats.QuestionText, stats.TotalAttempts)
				} else {
					log.Printf("GetChallengingQuestions: Warning - Question ID %s not found in questionStats", qid.Hex())
				}
			}

			// Increment incorrect attempts for incorrectly answered questions
			if qr.IncorrectlyAnsweredQuestions != nil {
				log.Printf("GetChallengingQuestions: Found %d incorrectly answered questions for this attempt", len(qr.IncorrectlyAnsweredQuestions))
				for _, qid := range qr.IncorrectlyAnsweredQuestions {
					log.Printf("GetChallengingQuestions: Processing incorrect answer for question ID %s", qid.Hex())
					if stats, exists := questionStats[qid]; exists {
						stats.IncorrectAttempts++
						questionStats[qid] = stats
						log.Printf("GetChallengingQuestions: Incremented IncorrectAttempts for question ID %s (text: %s): %d",
							qid.Hex(), stats.QuestionText, stats.IncorrectAttempts)
					} else {
						log.Printf("GetChallengingQuestions: Warning - Question ID %s not found in quiz data", qid.Hex())
					}
				}
			} else {
				log.Printf("GetChallengingQuestions: No incorrectly answered questions for attempt at %v", qr.Timestamp)
			}

			// Log stats after updates
			for qid, stats := range questionStats {
				log.Printf("GetChallengingQuestions: After update - Question ID %s (text: %s): TotalAttempts=%d, IncorrectAttempts=%d",
					qid.Hex(), stats.QuestionText, stats.TotalAttempts, stats.IncorrectAttempts)
			}
		}
	}

	// Log final stats before calculating rates
	log.Printf("GetChallengingQuestions: Final stats before calculating rates:")
	for qid, stats := range questionStats {
		log.Printf("GetChallengingQuestions: Final - Question ID %s (text: %s): TotalAttempts=%d, IncorrectAttempts=%d",
			qid.Hex(), stats.QuestionText, stats.TotalAttempts, stats.IncorrectAttempts)
	}

	// Convert to slice and calculate incorrect rates
	var challengingQuestions []struct {
		Question      string  `json:"question"`
		IncorrectRate float64 `json:"incorrect_rate"`
	}

	for _, stats := range questionStats {
		if stats.TotalAttempts > 0 {
			incorrectRate := float64(stats.IncorrectAttempts) / float64(stats.TotalAttempts) * 100
			log.Printf("GetChallengingQuestions: Calculating rate for question %s: %d incorrect out of %d total attempts = %.2f%%",
				stats.QuestionText, stats.IncorrectAttempts, stats.TotalAttempts, incorrectRate)

			// Only include questions that have been attempted at least once
			if stats.TotalAttempts > 0 {
				challengingQuestions = append(challengingQuestions, struct {
					Question      string  `json:"question"`
					IncorrectRate float64 `json:"incorrect_rate"`
				}{
					Question:      stats.QuestionText,
					IncorrectRate: incorrectRate,
				})
			}
		}
	}

	// Sort by incorrect rate in descending order
	sort.Slice(challengingQuestions, func(i, j int) bool {
		return challengingQuestions[i].IncorrectRate > challengingQuestions[j].IncorrectRate
	})

	// Take top 5 most challenging questions
	if len(challengingQuestions) > 5 {
		challengingQuestions = challengingQuestions[:5]
	}

	log.Printf("GetChallengingQuestions: Returning %d challenging questions for quiz %s", len(challengingQuestions), quizID)
	metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "200").Inc()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(challengingQuestions)
}

func containsObjectID(slice []primitive.ObjectID, val primitive.ObjectID) bool {
	for _, item := range slice {
		if item == val {
			return true
		}
	}
	return false
}

// GET /user/quiz/{quizId}/question-statistics
func GetQuestionStatistics(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	if claims.Role != string(models.RoleTeacher) && claims.Role != string(models.RoleAdmin) {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "403").Inc()
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	quizID := mux.Vars(r)["quizId"]
	log.Printf("GetQuestionStatistics: Received request for quiz ID: %s", quizID)

	quizOID, err := primitive.ObjectIDFromHex(quizID)
	if err != nil {
		log.Printf("GetQuestionStatistics: Invalid quiz ID format: %s", quizID)
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// First, get the quiz questions from evaluation service
	client := &http.Client{
		Timeout: 5 * time.Second,
		Transport: &http.Transport{
			MaxIdleConns:        100,
			MaxIdleConnsPerHost: 100,
			IdleConnTimeout:     90 * time.Second,
		},
	}

	var quizData struct {
		Questions []struct {
			ID   primitive.ObjectID `json:"id"`
			Text string             `json:"text"`
		} `json:"questions"`
	}

	evalURL := fmt.Sprintf("%s/evaluation/quiz/%s", utils.GetEnv("EVAL_SERVICE_URL", "http://localhost:8000"), quizOID.Hex())
	reqEval, err := http.NewRequestWithContext(ctx, "GET", evalURL, nil)
	if err != nil {
		log.Printf("GetQuestionStatistics: Error creating request to evaluation service: %v", err)
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Error contacting evaluation service", http.StatusInternalServerError)
		return
	}
	reqEval.Header.Set("Authorization", r.Header.Get("Authorization"))

	respEval, err := client.Do(reqEval)
	if err != nil {
		log.Printf("GetQuestionStatistics: Error contacting evaluation service: %v", err)
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Error contacting evaluation service", http.StatusInternalServerError)
		return
	}
	defer respEval.Body.Close()

	if respEval.StatusCode != http.StatusOK {
		log.Printf("GetQuestionStatistics: Evaluation service returned status %d", respEval.StatusCode)
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Error fetching quiz data", http.StatusInternalServerError)
		return
	}

	if err := json.NewDecoder(respEval.Body).Decode(&quizData); err != nil {
		log.Printf("GetQuestionStatistics: Error decoding quiz data: %v", err)
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Error decoding quiz data", http.StatusInternalServerError)
		return
	}

	// Create a map of question IDs to text for later use
	questionTexts := make(map[primitive.ObjectID]string)
	for _, q := range quizData.Questions {
		questionTexts[q.ID] = q.Text
	}

	// Use MongoDB aggregation to calculate statistics
	pipeline := []bson.M{
		// Match users who have attempted this quiz
		{
			"$match": bson.M{
				"quiz_results": bson.M{
					"$elemMatch": bson.M{
						"quiz_id": quizOID,
					},
				},
			},
		},
		// Unwind the quiz_results array
		{
			"$unwind": "$quiz_results",
		},
		// Match only results for this quiz
		{
			"$match": bson.M{
				"quiz_results.quiz_id": quizOID,
			},
		},
		// Project only the fields we need
		{
			"$project": bson.M{
				"score":                "$quiz_results.score",
				"max_score":            "$quiz_results.max_score",
				"incorrectly_answered": "$quiz_results.incorrectly_answered_questions",
				"timestamp":            "$quiz_results.timestamp",
			},
		},
	}

	cursor, err := db.UserCollection.Aggregate(ctx, pipeline)
	if err != nil {
		log.Printf("GetQuestionStatistics: Error in aggregation: %v", err)
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Error calculating statistics", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	// Process the aggregation results
	type AggResult struct {
		Score               int                  `bson:"score"`
		MaxScore            int                  `bson:"max_score"`
		IncorrectlyAnswered []primitive.ObjectID `bson:"incorrectly_answered"`
		Timestamp           time.Time            `bson:"timestamp"`
	}

	var results []AggResult
	if err := cursor.All(ctx, &results); err != nil {
		log.Printf("GetQuestionStatistics: Error decoding aggregation results: %v", err)
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Error processing statistics", http.StatusInternalServerError)
		return
	}

	// Calculate statistics for each question
	questionStats := make(map[primitive.ObjectID]struct {
		TotalAttempts     int
		IncorrectAttempts int
		QuestionText      string
	})

	// Initialize stats for all questions
	for _, q := range quizData.Questions {
		questionStats[q.ID] = struct {
			TotalAttempts     int
			IncorrectAttempts int
			QuestionText      string
		}{
			QuestionText: q.Text,
		}
	}

	// Process each quiz attempt
	for _, result := range results {
		log.Printf("GetQuestionStatistics: Processing attempt - Score: %d/%d, Timestamp: %v, IncorrectlyAnswered: %v",
			result.Score, result.MaxScore, result.Timestamp, result.IncorrectlyAnswered)

		// If we have a valid score, increment total attempts for all questions
		if result.MaxScore > 0 {
			for qid := range questionStats {
				stats := questionStats[qid]
				stats.TotalAttempts++
				questionStats[qid] = stats
			}
		}

		// Process incorrectly answered questions
		if result.IncorrectlyAnswered != nil {
			for _, qid := range result.IncorrectlyAnswered {
				if stats, exists := questionStats[qid]; exists {
					stats.IncorrectAttempts++
					questionStats[qid] = stats
					log.Printf("GetQuestionStatistics: Incremented IncorrectAttempts for question %s: %d",
						stats.QuestionText, stats.IncorrectAttempts)
				}
			}
		}
	}

	// Convert to response format
	var questionStatsList []struct {
		Question          string  `json:"question"`
		IncorrectRate     float64 `json:"incorrect_rate"`
		TotalAttempts     int     `json:"total_attempts"`
		IncorrectAttempts int     `json:"incorrect_attempts"`
	}

	for _, stats := range questionStats {
		if stats.TotalAttempts > 0 {
			incorrectRate := float64(stats.IncorrectAttempts) / float64(stats.TotalAttempts) * 100
			questionStatsList = append(questionStatsList, struct {
				Question          string  `json:"question"`
				IncorrectRate     float64 `json:"incorrect_rate"`
				TotalAttempts     int     `json:"total_attempts"`
				IncorrectAttempts int     `json:"incorrect_attempts"`
			}{
				Question:          stats.QuestionText,
				IncorrectRate:     incorrectRate,
				TotalAttempts:     stats.TotalAttempts,
				IncorrectAttempts: stats.IncorrectAttempts,
			})
		}
	}

	// Sort by incorrect rate in descending order
	sort.Slice(questionStatsList, func(i, j int) bool {
		return questionStatsList[i].IncorrectRate > questionStatsList[j].IncorrectRate
	})

	// Take top 5 most challenging questions
	if len(questionStatsList) > 5 {
		questionStatsList = questionStatsList[:5]
	}

	log.Printf("GetQuestionStatistics: Returning statistics for %d questions", len(questionStatsList))
	metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "200").Inc()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(questionStatsList)
}
