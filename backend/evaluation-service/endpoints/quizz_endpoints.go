package handlers

import (
	"context"
	"encoding/json"
	helpers "evaluation-service/helpers"
	models "evaluation-service/models"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
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
