package handlers

import (
	"context"
	"encoding/json"
	helpers "evaluation-service/helpers"
	models "evaluation-service/models"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

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
