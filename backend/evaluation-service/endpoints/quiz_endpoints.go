package endpoints

import (
	"bytes"
	"context"
	"encoding/json"
	helpers "evaluation-service/helpers"
	"evaluation-service/metrics"
	models "evaluation-service/models"
	"log"
	"net/http"
	"os"
	"sort"
	"time"

	"evaluation-service/utils"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// POST /evaluation/quiz
func CreateQuiz(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	path := utils.NormalizePath(r.URL.Path)
	defer func() {
		metrics.EvaluationDuration.WithLabelValues(path).Observe(time.Since(start).Seconds())
	}()

	var quiz models.Quiz
	if err := json.NewDecoder(r.Body).Decode(&quiz); err != nil {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Ensure each question has an ID
	for i := range quiz.Questions {
		if quiz.Questions[i].ID.IsZero() {
			quiz.Questions[i].ID = primitive.NewObjectID()
		}
	}

	quiz.ID = primitive.NewObjectID()
	quiz.CreatedAt = time.Now()
	quiz.IsOpen = true

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := helpers.Client.Database("data-feed-db").Collection("quizzes").InsertOne(ctx, quiz)
	if err != nil {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "Failed to create quiz", http.StatusInternalServerError)
		return
	}

	metrics.EvaluationOperations.WithLabelValues(path, "success").Inc()
	metrics.ActiveEvaluations.Inc()
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(quiz)
}

// GET /evaluation/quiz
func GetAllQuizzes(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	path := utils.NormalizePath(r.URL.Path)
	defer func() {
		metrics.EvaluationDuration.WithLabelValues(path).Observe(time.Since(start).Seconds())
	}()

	collection := helpers.Client.Database("data-feed-db").Collection("quizzes")
	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.Background())

	var quizzes []models.Quiz
	if err := cursor.All(context.Background(), &quizzes); err != nil {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	metrics.EvaluationOperations.WithLabelValues(path, "success").Inc()
	json.NewEncoder(w).Encode(quizzes)
}

// GET /evaluation/quiz/{quiz_id}
func GetQuizByID(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	path := utils.NormalizePath(r.URL.Path)
	defer func() {
		metrics.EvaluationDuration.WithLabelValues(path).Observe(time.Since(start).Seconds())
	}()

	idStr := mux.Vars(r)["quiz_id"]
	quizID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
		return
	}

	var quiz models.Quiz
	collection := helpers.Client.Database("data-feed-db").Collection("quizzes")
	err = collection.FindOne(context.Background(), bson.M{"_id": quizID}).Decode(&quiz)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			metrics.EvaluationOperations.WithLabelValues(path, "not_found").Inc()
			http.Error(w, "Quiz not found", http.StatusNotFound)
			return
		}
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	metrics.EvaluationOperations.WithLabelValues(path, "success").Inc()
	json.NewEncoder(w).Encode(quiz)
}

// PUT /evaluation/quiz/{id}
func UpdateQuiz(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	path := utils.NormalizePath(r.URL.Path)
	defer func() {
		metrics.EvaluationDuration.WithLabelValues(path).Observe(time.Since(start).Seconds())
	}()

	idStr := mux.Vars(r)["id"]
	quizID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
		return
	}

	var input models.QuizInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	classID, err := primitive.ObjectIDFromHex(input.ClassID)
	if err != nil {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "Invalid class_id", http.StatusBadRequest)
		return
	}

	update := bson.M{
		"$set": bson.M{
			"title":     input.Title,
			"class_id":  classID,
			"questions": input.Questions,
		},
	}

	collection := helpers.Client.Database("data-feed-db").Collection("quizzes")
	result, err := collection.UpdateByID(context.Background(), quizID, update)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			metrics.EvaluationOperations.WithLabelValues(path, "not_found").Inc()
			http.Error(w, "Quiz not found", http.StatusNotFound)
			return
		}
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	metrics.EvaluationOperations.WithLabelValues(path, "success").Inc()
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Quiz updated",
		"result":  result,
	})
}

// DELETE /evaluation/quiz/{id}
func DeleteQuiz(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	path := utils.NormalizePath(r.URL.Path)
	defer func() {
		metrics.EvaluationDuration.WithLabelValues(path).Observe(time.Since(start).Seconds())
	}()

	idStr := mux.Vars(r)["id"]
	quizID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
		return
	}

	collection := helpers.Client.Database("data-feed-db").Collection("quizzes")
	result, err := collection.DeleteOne(context.Background(), bson.M{"_id": quizID})
	if err != nil {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if result.DeletedCount == 0 {
		metrics.EvaluationOperations.WithLabelValues(path, "not_found").Inc()
		http.Error(w, "Quiz not found", http.StatusNotFound)
		return
	}

	metrics.EvaluationOperations.WithLabelValues(path, "success").Inc()
	metrics.ActiveEvaluations.Dec()
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Deleted",
	})
}

// GET /evaluation/quiz/class/{class_id}
func GetQuizzesByClass(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	path := utils.NormalizePath(r.URL.Path)
	defer func() {
		metrics.EvaluationDuration.WithLabelValues(path).Observe(time.Since(start).Seconds())
	}()

	classIDStr := mux.Vars(r)["class_id"]
	classID, err := primitive.ObjectIDFromHex(classIDStr)
	if err != nil {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "Invalid class ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := helpers.Client.Database("data-feed-db").Collection("quizzes").
		Find(ctx, bson.M{"class_id": classID})

	if err != nil {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var quizzes []models.Quiz
	if err := cursor.All(ctx, &quizzes); err != nil {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "Error decoding quizzes: "+err.Error(), http.StatusInternalServerError)
		return
	}

	metrics.EvaluationOperations.WithLabelValues(path, "success").Inc()
	json.NewEncoder(w).Encode(quizzes)
}

// GET /evaluation/quiz/meta/{quiz_id}
func GetQuizMeta(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	path := utils.NormalizePath(r.URL.Path)
	defer func() {
		metrics.EvaluationDuration.WithLabelValues(path).Observe(time.Since(start).Seconds())
	}()

	qID, err := primitive.ObjectIDFromHex(mux.Vars(r)["quiz_id"])
	if err != nil {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "invalid quiz ID", http.StatusBadRequest)
		return
	}

	proj := bson.M{
		"_id":                  1,
		"title":                1,
		"class_id":             1,
		"created_at":           1,
		"questions._id":        1,
		"questions.text":       1,
		"questions.points":     1,
		"questions.type":       1,
		"questions.difficulty": 1,
		"is_open":              1,
	}

	var meta struct {
		ID        primitive.ObjectID `bson:"_id"         json:"id"`
		Title     string             `bson:"title"       json:"title"`
		ClassID   primitive.ObjectID `bson:"class_id"    json:"class_id"`
		CreatedAt time.Time          `bson:"created_at"  json:"created_at"`
		Questions []struct {
			ID         primitive.ObjectID `bson:"_id"        json:"id"`
			Text       string             `bson:"text"       json:"text"`
			Points     int                `bson:"points"     json:"points"`
			Type       string             `bson:"type"       json:"type"`
			Difficulty string             `bson:"difficulty" json:"difficulty"`
		} `bson:"questions" json:"questions"`
		IsOpen bool `bson:"is_open" json:"is_open"`
	}

	coll := helpers.Client.Database("data-feed-db").Collection("quizzes")
	err = coll.FindOne(
		r.Context(),
		bson.M{"_id": qID},
		options.FindOne().SetProjection(proj),
	).Decode(&meta)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			metrics.EvaluationOperations.WithLabelValues(path, "not_found").Inc()
			http.Error(w, "Quiz not found", http.StatusNotFound)
		} else {
			metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
			http.Error(w, "DB error: "+err.Error(), http.StatusInternalServerError)
		}
		return
	}

	metrics.EvaluationOperations.WithLabelValues(path, "success").Inc()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(meta)
}

// GET /evaluation/quiz/{quizId}/result/{userId}
func GetLastResult(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	path := utils.NormalizePath(r.URL.Path)
	defer func() {
		metrics.EvaluationDuration.WithLabelValues(path).Observe(time.Since(start).Seconds())
	}()

	qID, err := primitive.ObjectIDFromHex(mux.Vars(r)["quizId"])
	if err != nil {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
		return
	}

	uID, err := primitive.ObjectIDFromHex(mux.Vars(r)["userId"])
	if err != nil {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	pipe := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"_id": qID}}},
		{{Key: "$unwind", Value: "$quiz_results"}},
		{{Key: "$match", Value: bson.M{"quiz_results.user_id": uID}}},
		{{Key: "$sort", Value: bson.M{"quiz_results.submitted_at": -1}}},
		{{Key: "$limit", Value: 1}},
		{{Key: "$project", Value: bson.M{
			"_id":   0,
			"score": "$quiz_results.score",
		}}},
	}

	ctx := context.Background()
	quizColl := helpers.Client.Database("data-feed-db").Collection("quizzes")

	cursor, err := quizColl.Aggregate(ctx, pipe)
	if err != nil {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	if cursor.Next(ctx) {
		var out struct {
			Score int `json:"score"`
		}
		_ = cursor.Decode(&out)
		metrics.EvaluationOperations.WithLabelValues(path, "success").Inc()
		json.NewEncoder(w).Encode(out)
		return
	}
	metrics.EvaluationOperations.WithLabelValues(path, "not_found").Inc()
	json.NewEncoder(w).Encode(struct {
		Score *int `json:"score"`
	}{Score: nil})
}

// GET /evaluation/quiz/attempt/{quizId}
func GetQuizForAttempt(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	path := utils.NormalizePath(r.URL.Path)
	defer func() {
		metrics.EvaluationDuration.WithLabelValues(path).Observe(time.Since(start).Seconds())
	}()

	idStr := mux.Vars(r)["quizId"]
	quizID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "invalid quiz id", http.StatusBadRequest)
		return
	}

	proj := bson.M{
		"_id":               1,
		"title":             1,
		"class_id":          1,
		"questions._id":     1,
		"questions.text":    1,
		"questions.images":  1,
		"questions.choices": 1,
		"questions.points":  1,
	}

	var quiz models.Quiz
	coll := helpers.Client.Database("data-feed-db").Collection("quizzes")

	if err := coll.
		FindOne(r.Context(), bson.M{"_id": quizID},
			options.FindOne().SetProjection(proj)).
		Decode(&quiz); err != nil {

		if err == mongo.ErrNoDocuments {
			metrics.EvaluationOperations.WithLabelValues(path, "not_found").Inc()
			http.Error(w, "quiz not found", http.StatusNotFound)
		} else {
			metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	metrics.EvaluationOperations.WithLabelValues(path, "success").Inc()
	json.NewEncoder(w).Encode(quiz)
}

// POST /evaluation/quiz/attempt/{quizId}
func SubmitAttempt(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	path := utils.NormalizePath(r.URL.Path)
	defer func() {
		metrics.EvaluationDuration.WithLabelValues(path).Observe(time.Since(start).Seconds())
	}()

	quizIDHex := mux.Vars(r)["quizId"]
	quizID, err := primitive.ObjectIDFromHex(quizIDHex)
	if err != nil {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "invalid quiz id", http.StatusBadRequest)
		return
	}

	claims := r.Context().Value("claims").(*utils.CustomClaims)
	userID, _ := primitive.ObjectIDFromHex(claims.UserID)

	var body struct {
		Answers []int `json:"answers"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "bad body", http.StatusBadRequest)
		return
	}

	var quiz models.Quiz
	coll := helpers.Client.Database("data-feed-db").Collection("quizzes")
	if err := coll.FindOne(r.Context(), bson.M{"_id": quizID}).Decode(&quiz); err != nil {
		if err == mongo.ErrNoDocuments {
			metrics.EvaluationOperations.WithLabelValues(path, "not_found").Inc()
			http.Error(w, "quiz not found", http.StatusNotFound)
		} else {
			metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	score := 0
	for i, q := range quiz.Questions {
		if i >= len(body.Answers) {
			continue
		}
		if q.Points == 0 {
			q.Points = 1
		}
		if containsInt(q.Answer, body.Answers[i]) {
			score += q.Points
		}
	}

	result := models.QuizResult{
		ID:          primitive.NewObjectID(),
		QuizID:      quizID,
		UserID:      userID,
		Answers:     body.Answers,
		Score:       score,
		SubmittedAt: time.Now(),
	}

	upd, err := coll.UpdateByID(
		r.Context(),
		quizID,
		bson.M{"$push": bson.M{"quiz_results": result}},
	)
	if err != nil {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		log.Printf("SubmitAttempt ERROR pushing result: %v", err)
		http.Error(w, "Failed to save result: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if upd.ModifiedCount == 0 {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		log.Printf("SubmitAttempt WARNING: no documents modified for quiz %s", quizIDHex)
		http.Error(w, "Quiz not found or not updated", http.StatusNotFound)
		return
	}

	metrics.EvaluationOperations.WithLabelValues(path, "success").Inc()
	log.Printf(
		"SubmitAttempt OK: quiz=%s user=%s score=%d modified=%d",
		quizIDHex, claims.UserID, score, upd.ModifiedCount,
	)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(bson.M{"score": score})
}

// GET /evaluation/quiz/{quizId}/results
func GetQuizResults(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	path := utils.NormalizePath(r.URL.Path)
	defer func() {
		metrics.EvaluationDuration.WithLabelValues(path).Observe(time.Since(start).Seconds())
	}()

	quizID, err := primitive.ObjectIDFromHex(mux.Vars(r)["quizId"])
	if err != nil {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
		return
	}

	coll := helpers.Client.Database("data-feed-db").Collection("quizzes")

	var quiz models.Quiz
	if err := coll.FindOne(r.Context(),
		bson.M{"_id": quizID},
		options.FindOne().SetProjection(bson.M{
			"quiz_results": 1,
			"questions": bson.M{
				"$map": bson.M{
					"input": "$questions",
					"as":    "q",
					"in": bson.M{
						"id":   "$$q._id",
						"text": "$$q.text",
					},
				},
			},
		}),
	).Decode(&quiz); err != nil {
		if err == mongo.ErrNoDocuments {
			metrics.EvaluationOperations.WithLabelValues(path, "not_found").Inc()
			http.Error(w, "Quiz not found", http.StatusNotFound)
		} else {
			metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	// Enhance results with question details
	type EnhancedResult struct {
		UserID                       primitive.ObjectID   `json:"user_id"`
		Score                        int                  `json:"score"`
		Points                       int64                `json:"points"`
		TimeTaken                    int64                `json:"time_taken"`
		SubmittedAt                  time.Time            `json:"submitted_at"`
		IncorrectlyAnsweredQuestions []primitive.ObjectID `json:"incorrectly_answered_questions"`
		PerformanceMetrics           struct {
			Accuracy    float64 `json:"accuracy"`
			Speed       float64 `json:"speed"`
			Consistency string  `json:"consistency"`
		} `json:"performance_metrics"`
	}

	var enhancedResults []EnhancedResult
	for _, result := range quiz.QuizResults {
		enhanced := EnhancedResult{
			UserID:                       result.UserID,
			Score:                        result.Score,
			Points:                       result.Points,
			TimeTaken:                    result.TimeTaken,
			SubmittedAt:                  result.SubmittedAt,
			IncorrectlyAnsweredQuestions: result.IncorrectlyAnsweredQuestions,
			PerformanceMetrics: struct {
				Accuracy    float64 `json:"accuracy"`
				Speed       float64 `json:"speed"`
				Consistency string  `json:"consistency"`
			}{
				Accuracy:    result.PerformanceMetrics.Accuracy,
				Speed:       result.PerformanceMetrics.Speed,
				Consistency: result.PerformanceMetrics.Consistency,
			},
		}
		enhancedResults = append(enhancedResults, enhanced)
	}

	metrics.EvaluationOperations.WithLabelValues(path, "success").Inc()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(enhancedResults)
}

// PUT /evaluation/quiz/{id}/status
func SetQuizStatus(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	path := utils.NormalizePath(r.URL.Path)
	defer func() {
		metrics.EvaluationDuration.WithLabelValues(path).Observe(time.Since(start).Seconds())
	}()

	claims := r.Context().Value("claims").(*utils.CustomClaims)
	if claims.Role != string(models.RoleTeacher) {
		metrics.EvaluationOperations.WithLabelValues(path, "forbidden").Inc()
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	idHex := mux.Vars(r)["id"]
	quizID, err := primitive.ObjectIDFromHex(idHex)
	if err != nil {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
		return
	}

	var body struct {
		IsOpen bool `json:"is_open"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	coll := helpers.Client.Database("data-feed-db").Collection("quizzes")

	var quiz models.Quiz
	if err := coll.FindOne(r.Context(), bson.M{"_id": quizID}).Decode(&quiz); err != nil {
		if err == mongo.ErrNoDocuments {
			metrics.EvaluationOperations.WithLabelValues(path, "not_found").Inc()
			http.Error(w, "Quiz not found", http.StatusNotFound)
		} else {
			metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}
	if quiz.OwnerID.Hex() != claims.UserID {
		metrics.EvaluationOperations.WithLabelValues(path, "forbidden").Inc()
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	upd, err := coll.UpdateByID(
		r.Context(),
		quizID,
		bson.M{"$set": bson.M{"is_open": body.IsOpen}},
	)
	if err != nil {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "Update failed: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if upd.ModifiedCount == 0 {
		metrics.EvaluationOperations.WithLabelValues(path, "not_found").Inc()
		http.Error(w, "No document updated", http.StatusNotFound)
		return
	}

	metrics.EvaluationOperations.WithLabelValues(path, "success").Inc()
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]bool{"is_open": body.IsOpen})
}

func containsInt(arr []int, v int) bool {
	for _, x := range arr {
		if x == v {
			return true
		}
	}
	return false
}

// calculatePoints calculates the total points for a quiz result
func calculatePoints(quiz *models.Quiz, result *models.QuizResult, userStats *models.UserQuizStats) int64 {
	var totalPoints int64

	// Base points from correct answers
	basePoints := int64(float64(result.Score) / float64(len(quiz.Questions)) * float64(quiz.MaxPoints))
	totalPoints += basePoints

	// Perfect score bonus
	if result.Score == len(quiz.Questions) && quiz.PerfectBonus > 0 {
		totalPoints += quiz.PerfectBonus
		result.PerfectBonus = quiz.PerfectBonus
	}

	// Time bonus
	if quiz.TimeBonus {
		// Calculate time bonus based on average completion time
		// More bonus for faster completion
		avgTime := float64(userStats.AverageTime)
		if avgTime > 0 {
			timeRatio := float64(result.TimeTaken) / avgTime
			if timeRatio < 0.5 { // Completed in less than half the average time
				timeBonus := int64(float64(quiz.MaxPoints) * 0.2) // 20% bonus
				totalPoints += timeBonus
				result.TimeBonus = timeBonus
			} else if timeRatio < 0.75 { // Completed in less than 75% of average time
				timeBonus := int64(float64(quiz.MaxPoints) * 0.1) // 10% bonus
				totalPoints += timeBonus
				result.TimeBonus = timeBonus
			}
		}
	}

	// Streak bonus
	if quiz.StreakBonus && userStats.ConsecutivePerfect > 0 {
		streakBonus := int64(float64(quiz.MaxPoints) * 0.05 * float64(userStats.ConsecutivePerfect)) // 5% per streak
		totalPoints += streakBonus
		result.StreakBonus = streakBonus
	}

	return totalPoints
}

// updateQuizStatistics updates the statistics for a quiz
func updateQuizStatistics(ctx context.Context, quizID primitive.ObjectID) error {
	// Get all results for this quiz
	cursor, err := helpers.Client.Database("data-feed-db").Collection("quizzes").Aggregate(ctx, []bson.M{
		{"$match": bson.M{"_id": quizID}},
		{"$unwind": "$quiz_results"},
		{"$group": bson.M{
			"_id":            "$_id",
			"total_attempts": bson.M{"$sum": 1},
			"average_score":  bson.M{"$avg": "$quiz_results.score"},
			"average_points": bson.M{"$avg": "$quiz_results.points"},
			"perfect_scores": bson.M{"$sum": bson.M{"$cond": []interface{}{bson.M{"$eq": []interface{}{"$quiz_results.score", bson.M{"$size": "$questions"}}}, 1, 0}}},
			"average_time":   bson.M{"$avg": "$quiz_results.time_taken"},
			"top_performers": bson.M{"$push": bson.M{
				"user_id":      "$quiz_results.user_id",
				"score":        "$quiz_results.score",
				"points":       "$quiz_results.points",
				"time_taken":   "$quiz_results.time_taken",
				"submitted_at": "$quiz_results.submitted_at",
			}},
		}},
	})
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)

	var stats []models.QuizStatistics
	if err = cursor.All(ctx, &stats); err != nil {
		return err
	}

	if len(stats) == 0 {
		return nil
	}

	// Sort top performers by points
	sort.Slice(stats[0].TopPerformers, func(i, j int) bool {
		return stats[0].TopPerformers[i].Points > stats[0].TopPerformers[j].Points
	})

	// Keep only top 10 performers
	if len(stats[0].TopPerformers) > 10 {
		stats[0].TopPerformers = stats[0].TopPerformers[:10]
	}

	// Update quiz with new statistics
	_, err = helpers.Client.Database("data-feed-db").Collection("quizzes").UpdateOne(
		ctx,
		bson.M{"_id": quizID},
		bson.M{"$set": bson.M{"statistics": stats[0]}},
	)
	return err
}

// Structura pentru request-ul de actualizare a statisticilor
type QuizStatisticsUpdateRequest struct {
	QuizID        string                 `json:"quiz_id"`
	TotalAttempts int                    `json:"total_attempts"`
	AverageScore  float64                `json:"average_score"`
	AveragePoints float64                `json:"average_points"`
	PerfectScores int                    `json:"perfect_scores"`
	AverageTime   float64                `json:"average_time"`
	TopPerformers []models.TopPerformer  `json:"top_performers"`
	QuestionStats []models.QuestionStats `json:"question_stats"`
}

// POST /evaluation/quiz/{id}/statistics
func UpdateQuizStatistics(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	path := utils.NormalizePath(r.URL.Path)
	defer func() {
		metrics.EvaluationDuration.WithLabelValues(path).Observe(time.Since(start).Seconds())
	}()

	quizIDStr := mux.Vars(r)["id"]
	quizID, err := primitive.ObjectIDFromHex(quizIDStr)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", path, "400").Inc()
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
		return
	}

	var req QuizStatisticsUpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", path, "400").Inc()
		log.Printf("Error decoding quiz statistics update request for quiz %s: %v", quizIDStr, err)
		http.Error(w, "Bad payload", http.StatusBadRequest)
		return
	}

	log.Printf("Received quiz statistics update for quiz %s: %+v", quizIDStr, req)

	// Fetch the existing quiz to update its statistics
	var quiz models.Quiz
	collection := helpers.Client.Database("data-feed-db").Collection("quizzes")
	err = collection.FindOne(context.Background(), bson.M{"_id": quizID}).Decode(&quiz)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			metrics.HTTPRequestsTotal.WithLabelValues("POST", path, "404").Inc()
			http.Error(w, "Quiz not found", http.StatusNotFound)
			return
		}
		metrics.HTTPRequestsTotal.WithLabelValues("POST", path, "500").Inc()
		http.Error(w, "Failed to fetch quiz", http.StatusInternalServerError)
		return
	}

	// Update the statistics fields
	quiz.Statistics.QuizID = quizID
	quiz.Statistics.TotalAttempts = req.TotalAttempts
	quiz.Statistics.AverageScore = req.AverageScore
	quiz.Statistics.AveragePoints = req.AveragePoints
	quiz.Statistics.PerfectScores = req.PerfectScores
	quiz.Statistics.AverageTime = req.AverageTime
	quiz.Statistics.TopPerformers = req.TopPerformers
	quiz.Statistics.QuestionStats = req.QuestionStats

	// Save the updated quiz statistics
	_, err = collection.UpdateOne(
		context.Background(),
		bson.M{"_id": quizID},
		bson.M{"$set": bson.M{"statistics": quiz.Statistics}},
	)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", path, "500").Inc()
		log.Printf("Error updating quiz statistics for quiz %s: %v", quizIDStr, err)
		http.Error(w, "Failed to update quiz statistics", http.StatusInternalServerError)
		return
	}

	metrics.HTTPRequestsTotal.WithLabelValues("POST", path, "200").Inc()
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Quiz statistics updated successfully"})
}

// POST /quiz/submit
func SubmitQuizResult(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	userOID, err := primitive.ObjectIDFromHex(claims.UserID)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	var req struct {
		QuizID    string `json:"quiz_id"`
		Answers   []int  `json:"answers"`
		TimeTaken int64  `json:"time_taken"`
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

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Get quiz and user stats
	var quiz models.Quiz
	if err := helpers.Client.Database("data-feed-db").Collection("quizzes").FindOne(ctx, bson.M{"_id": quizOID}).Decode(&quiz); err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "404").Inc()
		http.Error(w, "Quiz not found", http.StatusNotFound)
		return
	}

	// Get user's quiz statistics
	var userStats models.UserQuizStats
	err = helpers.Client.Database("data-feed-db").Collection("user_quiz_stats").FindOne(ctx, bson.M{
		"user_id": userOID,
		"quiz_id": quizOID,
	}).Decode(&userStats)

	if err == mongo.ErrNoDocuments {
		userStats = models.UserQuizStats{
			UserID: userOID,
			QuizID: quizOID,
		}
	} else if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Failed to get user stats", http.StatusInternalServerError)
		return
	}

	// Calculate score and track incorrectly answered questions
	score := 0
	var incorrectlyAnsweredQuestions []primitive.ObjectID
	for i, answer := range req.Answers {
		if i < len(quiz.Questions) {
			if containsInt(quiz.Questions[i].Answer, answer) {
				score++
			} else {
				incorrectlyAnsweredQuestions = append(incorrectlyAnsweredQuestions, quiz.Questions[i].ID)
			}
		}
	}

	// Calculate performance metrics
	accuracy := float64(score) / float64(len(quiz.Questions))
	speed := float64(req.TimeTaken) / float64(len(quiz.Questions)) // Average time per question
	consistency := "low"
	if accuracy >= 0.8 {
		consistency = "high"
	} else if accuracy >= 0.6 {
		consistency = "medium"
	}

	// Create result
	result := models.QuizResult{
		ID:                           primitive.NewObjectID(),
		QuizID:                       quizOID,
		UserID:                       userOID,
		Answers:                      req.Answers,
		Score:                        score,
		TimeTaken:                    req.TimeTaken,
		SubmittedAt:                  time.Now(),
		IncorrectlyAnsweredQuestions: incorrectlyAnsweredQuestions,
		PerformanceMetrics: struct {
			Accuracy    float64 `bson:"accuracy" json:"accuracy"`
			Speed       float64 `bson:"speed" json:"speed"`
			Consistency string  `bson:"consistency" json:"consistency"`
		}{
			Accuracy:    accuracy,
			Speed:       speed,
			Consistency: consistency,
		},
	}

	// Calculate points
	result.Points = calculatePoints(&quiz, &result, &userStats)

	// Update user stats
	userStats.TotalAttempts++
	userStats.AverageScore = (userStats.AverageScore*float64(userStats.TotalAttempts-1) + float64(score)) / float64(userStats.TotalAttempts)
	userStats.AverageTime = (userStats.AverageTime*float64(userStats.TotalAttempts-1) + float64(req.TimeTaken)) / float64(userStats.TotalAttempts)

	if score == len(quiz.Questions) {
		userStats.ConsecutivePerfect++
	} else {
		userStats.ConsecutivePerfect = 0
	}

	// Update quiz with new result
	_, err = helpers.Client.Database("data-feed-db").Collection("quizzes").UpdateOne(
		ctx,
		bson.M{"_id": quizOID},
		bson.M{"$push": bson.M{"quiz_results": result}},
	)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Failed to save result", http.StatusInternalServerError)
		return
	}

	// Update user stats
	_, err = helpers.Client.Database("data-feed-db").Collection("user_quiz_stats").UpdateOne(
		ctx,
		bson.M{"user_id": userOID, "quiz_id": quizOID},
		bson.M{"$set": userStats},
		options.Update().SetUpsert(true),
	)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Failed to update user stats", http.StatusInternalServerError)
		return
	}

	// Update quiz statistics
	if err := updateQuizStatistics(ctx, quizOID); err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Failed to update quiz statistics", http.StatusInternalServerError)
		return
	}

	// Notify user-data-service about points earned
	go func() {
		userDataURL := os.Getenv("USER_DATA_SERVICE_URL")
		if userDataURL == "" {
			userDataURL = "http://user-data-service:8080"
		}

		pointsReq := struct {
			QuizID   string `json:"quiz_id"`
			Score    int    `json:"score"`
			MaxScore int    `json:"max_score"`
		}{
			QuizID:   req.QuizID,
			Score:    score,
			MaxScore: len(quiz.Questions),
		}

		jsonData, _ := json.Marshal(pointsReq)
		http.Post(userDataURL+"/user/quiz/result", "application/json", bytes.NewBuffer(jsonData))
	}()

	metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "201").Inc()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// GET /quiz/{id}/statistics
func GetQuizStatistics(w http.ResponseWriter, r *http.Request) {
	quizID, err := primitive.ObjectIDFromHex(mux.Vars(r)["id"])
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", "/quiz/{id}/statistics", "400").Inc()
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
		return
	}

	var quiz models.Quiz
	if err := helpers.Client.Database("data-feed-db").Collection("quizzes").FindOne(r.Context(), bson.M{"_id": quizID}).Decode(&quiz); err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", "/quiz/{id}/statistics", "404").Inc()
		http.Error(w, "Quiz not found", http.StatusNotFound)
		return
	}

	metrics.HTTPRequestsTotal.WithLabelValues("GET", "/quiz/{id}/statistics", "200").Inc()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(quiz.Statistics)
}

// POST /evaluation/quiz/update-question-ids
func UpdateQuestionIDs(w http.ResponseWriter, r *http.Request) {
	log.Printf("UpdateQuestionIDs: Received request from %s", r.RemoteAddr)
	log.Printf("UpdateQuestionIDs: Request method: %s", r.Method)
	log.Printf("UpdateQuestionIDs: Request headers: %v", r.Header)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	collection := helpers.Client.Database("data-feed-db").Collection("quizzes")
	log.Printf("UpdateQuestionIDs: Connected to database")

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		log.Printf("UpdateQuestionIDs: Error fetching quizzes: %v", err)
		http.Error(w, "Failed to fetch quizzes", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	updatedCount := 0
	quizCount := 0
	for cursor.Next(ctx) {
		quizCount++
		var quiz struct {
			ID        primitive.ObjectID `bson:"_id"`
			Questions []struct {
				ID     primitive.ObjectID `bson:"_id,omitempty"`
				Text   string             `bson:"text"`
				Points int                `bson:"points"`
			} `bson:"questions"`
		}

		if err := cursor.Decode(&quiz); err != nil {
			log.Printf("UpdateQuestionIDs: Error decoding quiz: %v", err)
			continue
		}

		log.Printf("UpdateQuestionIDs: Processing quiz %s with %d questions", quiz.ID.Hex(), len(quiz.Questions))

		modified := false
		for i := range quiz.Questions {
			if quiz.Questions[i].ID.IsZero() {
				quiz.Questions[i].ID = primitive.NewObjectID()
				modified = true
				log.Printf("UpdateQuestionIDs: Added ID to question %d in quiz %s", i, quiz.ID.Hex())
			}
		}

		if modified {
			_, err := collection.UpdateOne(
				ctx,
				bson.M{"_id": quiz.ID},
				bson.M{"$set": bson.M{"questions": quiz.Questions}},
			)
			if err != nil {
				log.Printf("UpdateQuestionIDs: Error updating quiz %s: %v", quiz.ID.Hex(), err)
			} else {
				updatedCount++
				log.Printf("UpdateQuestionIDs: Successfully updated quiz %s", quiz.ID.Hex())
			}
		}
	}

	log.Printf("UpdateQuestionIDs: Processed %d quizzes, updated %d quizzes", quizCount, updatedCount)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":         "Question IDs update completed",
		"updated_quizzes": updatedCount,
		"total_quizzes":   quizCount,
	})
}
