package handlers

import (
	"context"
	"encoding/json"
	helpers "evaluation-service/helpers"
	models "evaluation-service/models"
	"net/http"
	"slices"
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
	var input models.QuizInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	classID, err := primitive.ObjectIDFromHex(input.ClassID)
	if err != nil {
		http.Error(w, "Invalid class_id", http.StatusBadRequest)
		return
	}

	ownerID, err := primitive.ObjectIDFromHex(input.OwnerID)
	if err != nil {
		http.Error(w, "Invalid owner_id", http.StatusBadRequest)
		return
	}

	quiz := models.Quiz{
		ID:        primitive.NewObjectID(),
		Title:     input.Title,
		ClassID:   classID,
		OwnerID:   ownerID,
		Questions: input.Questions,
		CreatedAt: time.Now(),
	}

	collection := helpers.Client.Database("data-feed-db").Collection("quizzes")
	if _, err := collection.InsertOne(context.TODO(), quiz); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(quiz)
}

// GET /evaluation/quiz
func GetAllQuizzes(w http.ResponseWriter, r *http.Request) {
	collection := helpers.Client.Database("data-feed-db").Collection("quizzes")
	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.Background())

	var quizzes []models.Quiz
	if err := cursor.All(context.Background(), &quizzes); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(quizzes)
}

// GET /evaluation/quiz/{quiz_id}
func GetQuizByID(w http.ResponseWriter, r *http.Request) {
	idStr := mux.Vars(r)["quiz_id"]
	quizID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
		return
	}

	var quiz models.Quiz
	collection := helpers.Client.Database("data-feed-db").Collection("quizzes")
	err = collection.FindOne(context.Background(), bson.M{"_id": quizID}).Decode(&quiz)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, "Quiz not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(quiz)
}

// PUT /evaluation/quiz/{id}
func UpdateQuiz(w http.ResponseWriter, r *http.Request) {
	idStr := mux.Vars(r)["id"]
	quizID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
		return
	}

	// Folosim QuizInput, la fel ca la CreateQuiz
	var input models.QuizInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	classID, err := primitive.ObjectIDFromHex(input.ClassID)
	if err != nil {
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
			http.Error(w, "Quiz not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Quiz updated",
		"result":  result,
	})
}

// DELETE /evaluation/quiz/{id}
func DeleteQuiz(w http.ResponseWriter, r *http.Request) {
	idStr := mux.Vars(r)["id"]
	quizID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
		return
	}

	collection := helpers.Client.Database("data-feed-db").Collection("quizzes")
	result, err := collection.DeleteOne(context.Background(), bson.M{"_id": quizID})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if result.DeletedCount == 0 {
		http.Error(w, "Quiz not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Deleted",
	})
}

// GET /evaluation/quiz/class/{class_id}
func GetQuizzesByClass(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	classIDStr := mux.Vars(r)["class_id"]
	classID, err := primitive.ObjectIDFromHex(classIDStr)
	if err != nil {
		http.Error(w, "Invalid class ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := helpers.Client.Database("data-feed-db").Collection("quizzes").
		Find(ctx, bson.M{"class_id": classID})

	if err != nil {
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var quizzes []models.Quiz
	if err := cursor.All(ctx, &quizzes); err != nil {
		http.Error(w, "Error decoding quizzes: "+err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(quizzes)
}

/*
	----------------------------------------------------------
	  GET /evaluation/quiz/meta/{id}
	  titlu, class_id, nr-întrebări, punctaj total – no responses

------------------------------------------------------------
*/
func GetQuizMeta(w http.ResponseWriter, r *http.Request) {
	qID, _ := primitive.ObjectIDFromHex(mux.Vars(r)["id"])

	p := bson.M{
		"title":      1,
		"class_id":   1,
		"created_at": 1,
		// nu trimitem răspunsuri
		"questions.text":   1,
		"questions.points": 1,
	}

	var meta struct {
		ID        primitive.ObjectID `json:"id"         bson:"_id"`
		Title     string             `json:"title"`
		ClassID   primitive.ObjectID `json:"class_id"`
		CreatedAt time.Time          `json:"created_at"`
		Questions []struct {
			Text   string `json:"text"`
			Points int    `json:"points"`
		} `json:"questions"`
	}
	quizColl := helpers.Client.Database("data-feed-db").Collection("quizzes")

	if err := quizColl.FindOne(
		r.Context(),
		bson.M{"_id": qID},
		options.FindOne().SetProjection(p)).
		Decode(&meta); err != nil {

		http.Error(w, "Quiz not found", http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(meta)
}

/*
	----------------------------------------------------------
	  GET /evaluation/quiz/{quizId}/result/{userId}
	  last score or null if not submitted yet

------------------------------------------------------------
*/
func GetLastResult(w http.ResponseWriter, r *http.Request) {
	qID, _ := primitive.ObjectIDFromHex(mux.Vars(r)["quizId"])
	uID, _ := primitive.ObjectIDFromHex(mux.Vars(r)["userId"])

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
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	if cursor.Next(ctx) {
		var out struct {
			Score int `json:"score"`
		}
		_ = cursor.Decode(&out)
		json.NewEncoder(w).Encode(out)
		return
	}
	json.NewEncoder(w).Encode(struct {
		Score *int `json:"score"`
	}{Score: nil})
}

// GET /evaluation/quiz/attempt/{id}
func GetQuizForAttempt(w http.ResponseWriter, r *http.Request) {
	idStr := mux.Vars(r)["id"]
	quizID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "invalid quiz id", http.StatusBadRequest)
		return
	}

	// proiectăm doar câmpurile necesare (fără Answer)
	proj := bson.M{
		"_id":               1,
		"title":             1,
		"class_id":          1,
		"questions._id":     1, // <-- AICI
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

		http.Error(w, "quiz not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(quiz)
}

// POST /evaluation/quiz/{id}/attempt
// body: { answers: []int }
func SubmitAttempt(w http.ResponseWriter, r *http.Request) {
	quizID, _ := primitive.ObjectIDFromHex(mux.Vars(r)["id"])
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	userID, _ := primitive.ObjectIDFromHex(claims.UserID)

	var body struct {
		Answers []int `json:"answers"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "Bad body", http.StatusBadRequest)
		return
	}

	var quiz models.Quiz
	quizColl := helpers.Client.Database("data-feed-db").Collection("quizzes")

	if err := quizColl.FindOne(r.Context(), bson.M{"_id": quizID}).Decode(&quiz); err != nil {
		http.Error(w, "Quiz not found", http.StatusNotFound)
		return
	}

	score := 0
	for i, q := range quiz.Questions {
		if i < len(body.Answers) && q.Answer != nil &&
			slices.Contains(q.Answer, body.Answers[i]) {
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

	_, _ = quizColl.UpdateByID(r.Context(), quizID,
		bson.M{"$push": bson.M{"quiz_results": result}})

	json.NewEncoder(w).Encode(bson.M{"score": score})
}
