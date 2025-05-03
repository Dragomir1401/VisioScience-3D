package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"user-data-service/models"
	db "user-data-service/mongo"

	"user-data-service/utils"
)

// POST /user/quiz/result
func SubmitUserQuizResult(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	userOID, err := primitive.ObjectIDFromHex(claims.UserID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	var req struct {
		QuizID string `json:"quiz_id"`
		Score  int    `json:"score"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Bad payload", http.StatusBadRequest)
		return
	}
	quizOID, err := primitive.ObjectIDFromHex(req.QuizID)
	if err != nil {
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
		return
	}

	meta := models.QuizResultMeta{
		QuizID:    quizOID,
		Score:     req.Score,
		Timestamp: time.Now(),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err = db.UserCollection.UpdateByID(
		ctx, userOID,
		bson.M{"$push": bson.M{"quiz_results": meta}},
	)
	if err != nil {
		http.Error(w, "DB error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Result saved"})
}

// GET /user/quiz/results/{quizId}
func GetQuizResultsForQuiz(w http.ResponseWriter, r *http.Request) {
	quizOID, err := primitive.ObjectIDFromHex(mux.Vars(r)["quizId"])
	if err != nil {
		http.Error(w, "Invalid quiz ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := db.UserCollection.Find(ctx,
		bson.M{"quiz_results.quiz_id": quizOID},
	)
	if err != nil {
		http.Error(w, "DB error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	type Out struct {
		UserID    primitive.ObjectID `json:"user_id"`
		Score     int                `json:"score"`
		Timestamp time.Time          `json:"timestamp"`
	}
	var all []Out
	for cursor.Next(ctx) {
		var u models.User
		if err := cursor.Decode(&u); err != nil {
			continue
		}
		for _, qr := range u.QuizResults {
			if qr.QuizID == quizOID {
				all = append(all, Out{u.ID, qr.Score, qr.Timestamp})
			}
		}
	}
	json.NewEncoder(w).Encode(all)
}
