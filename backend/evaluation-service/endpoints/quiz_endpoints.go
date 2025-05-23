package endpoints

import (
	"context"
	"encoding/json"
	helpers "evaluation-service/helpers"
	"evaluation-service/metrics"
	models "evaluation-service/models"
	"log"
	"net/http"
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

	ownerID, err := primitive.ObjectIDFromHex(input.OwnerID)
	if err != nil {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, "Invalid owner_id", http.StatusBadRequest)
		return
	}

	quiz := models.Quiz{
		ID:          primitive.NewObjectID(),
		Title:       input.Title,
		ClassID:     classID,
		OwnerID:     ownerID,
		Questions:   input.Questions,
		IsOpen:      false,
		CreatedAt:   time.Now(),
		QuizResults: []models.QuizResult{},
	}

	if input.IsOpen != nil {
		quiz.IsOpen = *input.IsOpen
	}

	collection := helpers.Client.Database("data-feed-db").Collection("quizzes")
	if _, err := collection.InsertOne(context.Background(), quiz); err != nil {
		metrics.EvaluationOperations.WithLabelValues(path, "error").Inc()
		http.Error(w, err.Error(), http.StatusInternalServerError)
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
		"_id":              1,
		"title":            1,
		"class_id":         1,
		"created_at":       1,
		"questions.text":   1,
		"questions.points": 1,
		"is_open":          1,
	}

	var meta struct {
		ID        primitive.ObjectID `bson:"_id"         json:"id"`
		Title     string             `bson:"title"       json:"title"`
		ClassID   primitive.ObjectID `bson:"class_id"    json:"class_id"`
		CreatedAt time.Time          `bson:"created_at"  json:"created_at"`
		Questions []struct {
			Text   string `bson:"text"   json:"text"`
			Points int    `bson:"points" json:"points"`
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
		options.FindOne().SetProjection(bson.M{"quiz_results": 1}),
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

	metrics.EvaluationOperations.WithLabelValues(path, "success").Inc()
	json.NewEncoder(w).Encode(quiz.QuizResults)
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
