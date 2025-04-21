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
	var quiz models.Quiz
	if err := json.NewDecoder(r.Body).Decode(&quiz); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	quiz.ID = primitive.NewObjectID()
	quiz.CreatedAt = time.Now()

	collection := helpers.Client.Database("data-feed-db").Collection("quizzes")
	_, err := collection.InsertOne(context.Background(), quiz)
	if err != nil {
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

	var updated models.Quiz
	if err := json.NewDecoder(r.Body).Decode(&updated); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	update := bson.M{
		"$set": bson.M{
			"title":     updated.Title,
			"class_id":  updated.ClassID,
			"owner_id":  updated.OwnerID,
			"questions": updated.Questions,
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

	json.NewEncoder(w).Encode(result)
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
func GetQuizzesByClassID(w http.ResponseWriter, r *http.Request) {
	classIDStr := mux.Vars(r)["class_id"]
	classID, err := primitive.ObjectIDFromHex(classIDStr)
	if err != nil {
		http.Error(w, "Invalid class ID", http.StatusBadRequest)
		return
	}

	collection := helpers.Client.Database("data-feed-db").Collection("quizzes")

	cursor, err := collection.Find(context.Background(), bson.M{"class_id": classID})
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
