package endpoints

import (
	"bytes"
	"context"
	"encoding/json"
	helpers "evaluation-service/helpers"
	"evaluation-service/metrics"
	models "evaluation-service/models"
	"fmt"
	"io/ioutil"
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

	// Log raw request body
	body, readErr := ioutil.ReadAll(r.Body)
	if readErr != nil {
		log.Printf("CreateQuiz: Error reading request body: %v", readErr)
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "Error reading request body", http.StatusBadRequest)
		return
	}
	log.Printf("CreateQuiz: Raw request body: %s", string(body))

	// Create a new reader with the body content
	r.Body = ioutil.NopCloser(bytes.NewBuffer(body))

	var input models.QuizInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		log.Printf("CreateQuiz: Error decoding request body: %v", err)
		log.Printf("CreateQuiz: Input data: %+v", input)
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	log.Printf("CreateQuiz: Received quiz with title: %s and %d questions", input.Title, len(input.Questions))
	log.Printf("CreateQuiz: Class ID: %s, Owner ID: %s", input.ClassID, input.OwnerID)

	// Convert input to Quiz model
	quiz := models.Quiz{
		ID:           primitive.NewObjectID(),
		Title:        input.Title,
		CreatedAt:    time.Now(),
		IsOpen:       true,
		MaxPoints:    input.MaxPoints,
		TimeBonus:    input.TimeBonus,
		PerfectBonus: input.PerfectBonus,
		StreakBonus:  input.StreakBonus,
		Difficulty:   input.Difficulty,
		Category:     input.Category,
		QuizResults:  []models.QuizResult{}, // Initialize empty array
		Statistics: models.QuizStatistics{
			QuizID:        primitive.NewObjectID(),
			TotalAttempts: 0,
			AverageScore:  0,
			AveragePoints: 0,
			PerfectScores: 0,
			AverageTime:   0,
			TopPerformers: []models.TopPerformer{},
			QuestionStats: []models.QuestionStats{},
		},
	}

	// Convert ClassID and OwnerID
	var convErr error
	log.Printf("CreateQuiz: Converting ClassID from hex: %s", input.ClassID)
	quiz.ClassID, convErr = primitive.ObjectIDFromHex(input.ClassID)
	if convErr != nil {
		log.Printf("CreateQuiz: Invalid class ID: %v", convErr)
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "Invalid class ID", http.StatusBadRequest)
		return
	}

	log.Printf("CreateQuiz: Converting OwnerID from hex: %s", input.OwnerID)
	quiz.OwnerID, convErr = primitive.ObjectIDFromHex(input.OwnerID)
	if convErr != nil {
		log.Printf("CreateQuiz: Invalid owner ID: %v", convErr)
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "Invalid owner ID", http.StatusBadRequest)
		return
	}

	// Process questions
	quiz.Questions = make([]models.Question, len(input.Questions))
	for i, q := range input.Questions {
		log.Printf("CreateQuiz: Processing question %d: %+v", i+1, q)

		// Create new question with generated ID
		newQuestion := models.Question{
			ID:      primitive.NewObjectID(),
			Text:    q.Text,
			Choices: q.Choices,
			Answer:  q.Answer,
			Points:  q.Points,
			Images:  q.Images,
		}

		log.Printf("CreateQuiz: Generated new question with ID: %s", newQuestion.ID.Hex())

		// Validate choices and answer
		if len(newQuestion.Choices) == 0 {
			log.Printf("CreateQuiz: Question %d has no choices, setting default choices", i+1)
			newQuestion.Choices = []string{"H2O", "CO2", "CH4", "O2"}
		}

		if len(newQuestion.Answer) == 0 {
			log.Printf("CreateQuiz: Question %d has no answer, setting default answer to first choice", i+1)
			newQuestion.Answer = []int{0} // Default to first choice
		}

		// Validate answer indices
		for _, ans := range newQuestion.Answer {
			if ans < 0 || ans >= len(newQuestion.Choices) {
				log.Printf("CreateQuiz: Invalid answer index %d for question %d (choices length: %d)",
					ans, i+1, len(newQuestion.Choices))
				metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
				http.Error(w, fmt.Sprintf("Invalid answer index for question %d", i+1), http.StatusBadRequest)
				return
			}
		}

		log.Printf("CreateQuiz: Question %d - ID: %s, Text: %s, Choices: %v, Answer: %v, Images: %v",
			i+1, newQuestion.ID.Hex(), newQuestion.Text, newQuestion.Choices, newQuestion.Answer, newQuestion.Images)

		quiz.Questions[i] = newQuestion
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	log.Printf("CreateQuiz: Attempting to insert quiz with ID: %s", quiz.ID.Hex())
	_, insertErr := helpers.Client.Database("data-feed-db").Collection("quizzes").InsertOne(ctx, quiz)
	if insertErr != nil {
		log.Printf("CreateQuiz: Error inserting quiz: %v", insertErr)
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "Failed to create quiz", http.StatusInternalServerError)
		return
	}

	log.Printf("CreateQuiz: Successfully created quiz with ID: %s", quiz.ID.Hex())
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

// Helper function to get quiz ID from parameters
func getQuizIDFromParams(r *http.Request) (primitive.ObjectID, error) {
	quizIDStr := mux.Vars(r)["quiz_id"]
	if quizIDStr == "" {
		return primitive.ObjectID{}, fmt.Errorf("no quiz ID provided")
	}

	quizID, err := primitive.ObjectIDFromHex(quizIDStr)
	if err != nil {
		return primitive.ObjectID{}, fmt.Errorf("invalid quiz ID format: %s", quizIDStr)
	}

	return quizID, nil
}

// GET /evaluation/quiz/{quiz_id}
func GetQuizByID(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	path := utils.NormalizePath(r.URL.Path)
	defer func() {
		metrics.EvaluationDuration.WithLabelValues(path).Observe(time.Since(start).Seconds())
	}()

	quizID, err := getQuizIDFromParams(r)
	if err != nil {
		log.Printf("GetQuizByID: %v", err)
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	log.Printf("GetQuizByID: Looking up quiz with ID: %s", quizID.Hex())
	var quiz models.Quiz
	collection := helpers.Client.Database("data-feed-db").Collection("quizzes")

	// Use a projection to ensure we get all fields
	opts := options.FindOne().SetProjection(bson.M{
		"_id":           1,
		"title":         1,
		"class_id":      1,
		"owner_id":      1,
		"questions":     1,
		"quiz_results":  1,
		"created_at":    1,
		"is_open":       1,
		"statistics":    1,
		"max_points":    1,
		"time_bonus":    1,
		"perfect_bonus": 1,
		"streak_bonus":  1,
		"difficulty":    1,
		"category":      1,
	})

	err = collection.FindOne(context.Background(), bson.M{"_id": quizID}, opts).Decode(&quiz)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			log.Printf("GetQuizByID: Quiz not found with ID: %s", quizID.Hex())
			metrics.EvaluationOperations.WithLabelValues(path, "not_found").Inc()
			http.Error(w, "Quiz not found", http.StatusNotFound)
			return
		}
		log.Printf("GetQuizByID: Database error for quiz ID %s: %v", quizID.Hex(), err)
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Ensure arrays are initialized
	if quiz.Questions == nil {
		quiz.Questions = []models.Question{}
	}
	if quiz.QuizResults == nil {
		quiz.QuizResults = []models.QuizResult{}
	}
	if quiz.Statistics.TopPerformers == nil {
		quiz.Statistics.TopPerformers = []models.TopPerformer{}
	}
	if quiz.Statistics.QuestionStats == nil {
		quiz.Statistics.QuestionStats = []models.QuestionStats{}
	}

	// Set the quiz ID in statistics if it's not set
	if quiz.Statistics.QuizID.IsZero() {
		quiz.Statistics.QuizID = quizID
	}

	// Log quiz details for debugging
	log.Printf("GetQuizByID: Found quiz - Title: %s, Questions: %d", quiz.Title, len(quiz.Questions))
	for i, q := range quiz.Questions {
		log.Printf("Question %d: ID=%s, Text=%s, Choices=%v, Answer=%v",
			i+1, q.ID.Hex(), q.Text, q.Choices, q.Answer)
	}

	metrics.EvaluationOperations.WithLabelValues(path, "success").Inc()
	json.NewEncoder(w).Encode(quiz)
}

// PUT /evaluation/quiz/{quiz_id}
func UpdateQuiz(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	path := utils.NormalizePath(r.URL.Path)
	defer func() {
		metrics.EvaluationDuration.WithLabelValues(path).Observe(time.Since(start).Seconds())
	}()

	quizID, err := getQuizIDFromParams(r)
	if err != nil {
		log.Printf("UpdateQuiz: %v", err)
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, err.Error(), http.StatusBadRequest)
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

// DELETE /evaluation/quiz/{quiz_id}
func DeleteQuiz(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	path := utils.NormalizePath(r.URL.Path)
	defer func() {
		metrics.EvaluationDuration.WithLabelValues(path).Observe(time.Since(start).Seconds())
	}()

	quizID, err := getQuizIDFromParams(r)
	if err != nil {
		log.Printf("DeleteQuiz: %v", err)
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, err.Error(), http.StatusBadRequest)
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
	log.Printf("[GetQuizzesByClass] Received class_id: %v", classIDStr)
	classID, err := primitive.ObjectIDFromHex(classIDStr)
	if err != nil {
		log.Printf("[GetQuizzesByClass] Invalid class ID: %v (input: %v)", err, classIDStr)
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "Invalid class ID", http.StatusBadRequest)
		return
	}

	log.Printf("[GetQuizzesByClass] Converted class_id to ObjectID: %v", classID.Hex())

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := helpers.Client.Database("data-feed-db").Collection("quizzes").
		Find(ctx, bson.M{"class_id": classID})

	if err != nil {
		log.Printf("[GetQuizzesByClass] Database error: %v", err)
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var quizzes []models.Quiz
	if err := cursor.All(ctx, &quizzes); err != nil {
		log.Printf("[GetQuizzesByClass] Error decoding quizzes: %v", err)
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "Error decoding quizzes: "+err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("[GetQuizzesByClass] Found %d quizzes for class_id %v", len(quizzes), classID.Hex())

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

	quizID, err := getQuizIDFromParams(r)
	if err != nil {
		log.Printf("GetQuizMeta: %v", err)
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, err.Error(), http.StatusBadRequest)
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

	// Set the quiz ID in statistics if it's not set
	if quiz.Statistics.QuizID.IsZero() {
		quiz.Statistics.QuizID = quizID
	}

	metrics.EvaluationOperations.WithLabelValues(path, "success").Inc()
	json.NewEncoder(w).Encode(quiz)
}

// GET /evaluation/quiz/{quiz_id}/result/{user_id}
func GetLastResult(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	path := utils.NormalizePath(r.URL.Path)
	defer func() {
		metrics.EvaluationDuration.WithLabelValues(path).Observe(time.Since(start).Seconds())
	}()

	quizID, err := getQuizIDFromParams(r)
	if err != nil {
		log.Printf("GetLastResult: %v", err)
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	userIDStr := mux.Vars(r)["user_id"]
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
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

	var lastResult *models.QuizResult
	for _, result := range quiz.QuizResults {
		if result.UserID == userID {
			if lastResult == nil || result.SubmittedAt.After(lastResult.SubmittedAt) {
				lastResult = &result
			}
		}
	}

	if lastResult == nil {
		metrics.EvaluationOperations.WithLabelValues(path, "not_found").Inc()
		http.Error(w, "No result found", http.StatusNotFound)
		return
	}

	metrics.EvaluationOperations.WithLabelValues(path, "success").Inc()
	json.NewEncoder(w).Encode(lastResult)
}

// GET /evaluation/quiz/attempt/{quiz_id}
func GetQuizForAttempt(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	path := utils.NormalizePath(r.URL.Path)
	defer func() {
		metrics.EvaluationDuration.WithLabelValues(path).Observe(time.Since(start).Seconds())
	}()

	quizID, err := getQuizIDFromParams(r)
	if err != nil {
		log.Printf("GetQuizForAttempt: %v", err)
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	log.Printf("GetQuizForAttempt: Received request for quiz ID: %s", quizID.Hex())

	// Use a projection to exclude answers and other sensitive data
	projection := bson.M{
		"_id":               1,
		"class_id":          1,
		"questions._id":     1,
		"questions.answer":  1,
		"questions.choices": 1,
		"questions.images":  1,
		"questions.points":  1,
		"questions.text":    1,
		"title":             1,
	}

	log.Printf("GetQuizForAttempt: Using projection: %v", projection)

	var quiz models.Quiz
	collection := helpers.Client.Database("data-feed-db").Collection("quizzes")
	err = collection.FindOne(context.Background(), bson.M{"_id": quizID}, options.FindOne().SetProjection(projection)).Decode(&quiz)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			log.Printf("GetQuizForAttempt: Quiz not found with ID: %s", quizID.Hex())
			metrics.EvaluationOperations.WithLabelValues(path, "not_found").Inc()
			http.Error(w, "Quiz not found", http.StatusNotFound)
			return
		}
		log.Printf("GetQuizForAttempt: Database error for quiz ID %s: %v", quizID.Hex(), err)
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("GetQuizForAttempt: Found quiz with title: %s", quiz.Title)
	log.Printf("GetQuizForAttempt: Number of questions: %d", len(quiz.Questions))

	for i, q := range quiz.Questions {
		log.Printf("Question %d: ID=%s, Text=%s, Choices=%v, Answer=%v",
			i+1, q.ID.Hex(), q.Text, q.Choices, q.Answer)
	}

	metrics.EvaluationOperations.WithLabelValues(path, "success").Inc()
	json.NewEncoder(w).Encode(quiz)
}

type SubmitAttemptRequest struct {
	QuizID    string `json:"quiz_id"`
	Answers   []int  `json:"answers"`
	TimeTaken int    `json:"timeTaken"`
	MaxScore  int    `json:"maxScore"`
	ClassID   string `json:"class_id"`
}

type SubmitAttemptResponse struct {
	Score                        int                  `json:"score"`
	MaxScore                     int                  `json:"maxScore"`
	CorrectAnswers               []bool               `json:"correctAnswers"`
	IncorrectlyAnsweredQuestions []primitive.ObjectID `json:"incorrectlyAnsweredQuestions"`
	Points                       int64                `json:"points"`
	TimeBonus                    int64                `json:"timeBonus"`
	PerfectBonus                 int64                `json:"perfectBonus"`
	StreakBonus                  int64                `json:"streakBonus"`
}

// Helper pentru conversie []primitive.ObjectID -> []string
func convertObjectIDsToHex(ids []primitive.ObjectID) []string {
	out := make([]string, len(ids))
	for i, id := range ids {
		out[i] = id.Hex()
	}
	return out
}

// POST /evaluation/quiz/attempt/{quiz_id}
func SubmitAttempt(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	userOID, err := primitive.ObjectIDFromHex(claims.UserID)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	var req SubmitAttemptRequest
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

	classOID, err := primitive.ObjectIDFromHex(req.ClassID)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "Invalid class ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var quiz models.Quiz
	if err := helpers.Client.Database("data-feed-db").Collection("quizzes").FindOne(ctx, bson.M{"_id": quizOID}).Decode(&quiz); err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "404").Inc()
		http.Error(w, "Quiz not found", http.StatusNotFound)
		return
	}

	// Validate answers length matches questions length
	if len(req.Answers) != len(quiz.Questions) {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "Number of answers doesn't match number of questions", http.StatusBadRequest)
		return
	}

	var score int
	var correctAnswers []bool
	var incorrectlyAnsweredQuestions []primitive.ObjectID

	// Check each answer
	for i, q := range quiz.Questions {
		isCorrect := false
		if containsInt(q.Answer, req.Answers[i]) {
			score++
			isCorrect = true
		} else {
			incorrectlyAnsweredQuestions = append(incorrectlyAnsweredQuestions, q.ID)
		}
		correctAnswers = append(correctAnswers, isCorrect)
	}

	// Calculate bonuses
	timeBonus := int64(0)
	if quiz.TimeBonus {
		timeBonus = calculateTimeBonus(req.TimeTaken)
	}

	perfectBonus := int64(0)
	if quiz.PerfectBonus > 0 && score == len(quiz.Questions) {
		perfectBonus = int64(quiz.PerfectBonus)
	}

	streakBonus := int64(0)
	if quiz.StreakBonus {
		streakBonus = calculateStreakBonus(correctAnswers)
	}

	// Calculate total points
	points := calculatePoints(&quiz, score, int(timeBonus), int(perfectBonus), int(streakBonus))

	response := SubmitAttemptResponse{
		Score:                        score,
		MaxScore:                     len(quiz.Questions),
		CorrectAnswers:               correctAnswers,
		IncorrectlyAnsweredQuestions: incorrectlyAnsweredQuestions,
		Points:                       points,
		TimeBonus:                    timeBonus,
		PerfectBonus:                 perfectBonus,
		StreakBonus:                  streakBonus,
	}

	now := time.Now()
	result := models.QuizResult{
		UserID:                       userOID,
		QuizID:                       quizOID,
		ClassID:                      classOID,
		Score:                        score,
		MaxScore:                     quiz.MaxPoints,
		TimeTaken:                    int64(req.TimeTaken),
		SubmittedAt:                  now,
		IncorrectlyAnsweredQuestions: incorrectlyAnsweredQuestions,
	}

	// Update user stats
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

		log.Printf("[SubmitAttempt] User %s, Quiz %s: Incorrectly answered questions: %v", userOID.Hex(), quizOID.Hex(), convertObjectIDsToHex(incorrectlyAnsweredQuestions))

		pointsReq := struct {
			QuizID                       string   `json:"quiz_id"`
			Score                        int      `json:"score"`
			MaxScore                     int      `json:"max_score"`
			IncorrectlyAnsweredQuestions []string `json:"incorrectly_answered_questions"`
		}{
			QuizID:                       req.QuizID,
			Score:                        score,
			MaxScore:                     len(quiz.Questions),
			IncorrectlyAnsweredQuestions: convertObjectIDsToHex(incorrectlyAnsweredQuestions),
		}

		log.Printf("[SubmitAttempt] Sending to user-data-service: QuizID=%s, Score=%d, MaxScore=%d, IncorrectlyAnsweredQuestions=%v", req.QuizID, score, len(quiz.Questions), convertObjectIDsToHex(incorrectlyAnsweredQuestions))

		jsonData, _ := json.Marshal(pointsReq)
		http.Post(userDataURL+"/user/quiz/result", "application/json", bytes.NewBuffer(jsonData))
	}()

	metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "201").Inc()
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// GET /evaluation/quiz/{quiz_id}/results
func GetQuizResults(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	path := utils.NormalizePath(r.URL.Path)
	defer func() {
		metrics.EvaluationDuration.WithLabelValues(path).Observe(time.Since(start).Seconds())
	}()

	quizID, err := getQuizIDFromParams(r)
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
		enhancedResults = append(enhancedResults, EnhancedResult{
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
		})
	}

	metrics.EvaluationOperations.WithLabelValues(path, "success").Inc()
	json.NewEncoder(w).Encode(enhancedResults)
}

// PUT /evaluation/quiz/{quiz_id}/status
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

	quizID, err := getQuizIDFromParams(r)
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

	metrics.EvaluationOperations.WithLabelValues(path, "success").Inc()
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Quiz status updated",
		"result":  upd,
	})
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
func calculatePoints(quiz *models.Quiz, score int, timeBonus int, perfectBonus int, streakBonus int) int64 {
	basePoints := int64(score * 10) // 10 points per correct answer
	return basePoints + int64(timeBonus) + int64(perfectBonus) + int64(streakBonus)
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

// POST /evaluation/quiz/{quiz_id}/statistics
func UpdateQuizStatistics(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	path := utils.NormalizePath(r.URL.Path)
	defer func() {
		metrics.EvaluationDuration.WithLabelValues(path).Observe(time.Since(start).Seconds())
	}()

	quizID, err := getQuizIDFromParams(r)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", path, "400").Inc()
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
		return
	}

	var req QuizStatisticsUpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", path, "400").Inc()
		log.Printf("Error decoding quiz statistics update request for quiz %s: %v", quizID.Hex(), err)
		http.Error(w, "Bad payload", http.StatusBadRequest)
		return
	}

	log.Printf("Received quiz statistics update for quiz %s: %+v", quizID.Hex(), req)

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
		log.Printf("Error updating quiz statistics for quiz %s: %v", quizID.Hex(), err)
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

	// Create result
	result := models.QuizResult{
		UserID:                       userOID,
		QuizID:                       quizOID,
		Score:                        score,
		TimeTaken:                    int64(req.TimeTaken),
		SubmittedAt:                  time.Now(),
		IncorrectlyAnsweredQuestions: incorrectlyAnsweredQuestions,
	}

	// Calculate points
	result.Points = calculatePoints(&quiz, score, 0, 0, 0)

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
			QuizID                       string   `json:"quiz_id"`
			Score                        int      `json:"score"`
			MaxScore                     int      `json:"max_score"`
			IncorrectlyAnsweredQuestions []string `json:"incorrectly_answered_questions"`
		}{
			QuizID:                       req.QuizID,
			Score:                        score,
			MaxScore:                     len(quiz.Questions),
			IncorrectlyAnsweredQuestions: convertObjectIDsToHex(incorrectlyAnsweredQuestions),
		}

		jsonData, _ := json.Marshal(pointsReq)
		http.Post(userDataURL+"/user/quiz/result", "application/json", bytes.NewBuffer(jsonData))
	}()

	metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "201").Inc()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// GET /quiz/{quiz_id}/statistics
func GetQuizStatistics(w http.ResponseWriter, r *http.Request) {
	quizID, err := getQuizIDFromParams(r)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", "/quiz/{quiz_id}/statistics", "400").Inc()
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
		return
	}

	var quiz models.Quiz
	if err := helpers.Client.Database("data-feed-db").Collection("quizzes").FindOne(r.Context(), bson.M{"_id": quizID}).Decode(&quiz); err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", "/quiz/{quiz_id}/statistics", "404").Inc()
		http.Error(w, "Quiz not found", http.StatusNotFound)
		return
	}

	metrics.HTTPRequestsTotal.WithLabelValues("GET", "/quiz/{quiz_id}/statistics", "200").Inc()
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

// POST /evaluation/quiz/add-mock-answers
func AddMockAnswers(w http.ResponseWriter, r *http.Request) {
	log.Printf("AddMockAnswers: Received request from %s", r.RemoteAddr)
	log.Printf("AddMockAnswers: Request method: %s", r.Method)
	log.Printf("AddMockAnswers: Request headers: %v", r.Header)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	collection := helpers.Client.Database("data-feed-db").Collection("quizzes")
	log.Printf("AddMockAnswers: Connected to database")

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		log.Printf("AddMockAnswers: Error fetching quizzes: %v", err)
		http.Error(w, "Failed to fetch quizzes", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	updatedCount := 0
	quizCount := 0
	questionsUpdated := 0

	for cursor.Next(ctx) {
		quizCount++
		var quiz struct {
			ID        primitive.ObjectID `bson:"_id"`
			Questions []struct {
				ID      primitive.ObjectID `bson:"_id,omitempty"`
				Text    string             `bson:"text"`
				Points  int                `bson:"points"`
				Choices []string           `bson:"choices,omitempty"`
				Answer  []int              `bson:"answer,omitempty"`
			} `bson:"questions"`
		}

		if err := cursor.Decode(&quiz); err != nil {
			log.Printf("AddMockAnswers: Error decoding quiz: %v", err)
			continue
		}

		log.Printf("AddMockAnswers: Processing quiz %s with %d questions", quiz.ID.Hex(), len(quiz.Questions))

		modified := false
		for i := range quiz.Questions {
			if quiz.Questions[i].ID.IsZero() {
				quiz.Questions[i].ID = primitive.NewObjectID()
				modified = true
				log.Printf("AddMockAnswers: Added ID to question %d in quiz %s", i, quiz.ID.Hex())
			}
		}

		if modified {
			_, err := collection.UpdateOne(
				ctx,
				bson.M{"_id": quiz.ID},
				bson.M{"$set": bson.M{"questions": quiz.Questions}},
			)
			if err != nil {
				log.Printf("AddMockAnswers: Error updating quiz %s: %v", quiz.ID.Hex(), err)
			} else {
				updatedCount++
				log.Printf("AddMockAnswers: Successfully updated quiz %s", quiz.ID.Hex())
			}
		}
	}

	log.Printf("AddMockAnswers: Processed %d quizzes, updated %d questions", quizCount, questionsUpdated)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":         "Question IDs update completed",
		"updated_quizzes": updatedCount,
		"total_quizzes":   quizCount,
	})
}

func calculateTimeBonus(timeTaken int) int64 {
	// Bonus points for completing quickly
	// Example: 10 points if completed under 30 seconds
	if timeTaken < 30 {
		return 10
	}
	return 0
}

func calculateStreakBonus(correctAnswers []bool) int64 {
	// Bonus points for consecutive correct answers
	var streak int
	var maxStreak int
	for _, correct := range correctAnswers {
		if correct {
			streak++
			if streak > maxStreak {
				maxStreak = streak
			}
		} else {
			streak = 0
		}
	}
	// Example: 5 points per correct answer in the longest streak
	return int64(maxStreak * 5)
}
