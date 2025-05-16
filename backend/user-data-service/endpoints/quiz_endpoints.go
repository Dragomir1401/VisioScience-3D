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

	"user-data-service/metrics"
	"user-data-service/utils"
)

// POST /user/quiz/result
func SubmitUserQuizResult(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	userOID, err := primitive.ObjectIDFromHex(claims.UserID)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", "/user/quiz/result", "400").Inc()
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	var req struct {
		QuizID string `json:"quiz_id"`
		Score  int    `json:"score"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", "/user/quiz/result", "400").Inc()
		http.Error(w, "Bad payload", http.StatusBadRequest)
		return
	}
	quizOID, err := primitive.ObjectIDFromHex(req.QuizID)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", "/user/quiz/result", "400").Inc()
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
		metrics.HTTPRequestsTotal.WithLabelValues("POST", "/user/quiz/result", "500").Inc()
		http.Error(w, "DB error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	metrics.HTTPRequestsTotal.WithLabelValues("POST", "/user/quiz/result", "201").Inc()
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Result saved"})
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
