package main

import (
	"context"
	"log"
	"net/http"
	"time"

	handlers "evaluation-service/endpoints"
	helpers "evaluation-service/helpers"
	"evaluation-service/metrics"
	"evaluation-service/middleware"

	gorillaHandlers "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/prometheus/client_golang/prometheus"
	"go.mongodb.org/mongo-driver/bson"
)

func prometheusMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Skip metrics collection for the metrics endpoint itself
		if r.URL.Path == "/evaluation/metrics" {
			next.ServeHTTP(w, r)
			return
		}

		start := prometheus.NewTimer(metrics.HTTPRequestDuration.WithLabelValues(r.Method, helpers.NormalizePath(r.URL.Path)))
		next.ServeHTTP(w, r)
		start.ObserveDuration()
		metrics.HTTPRequestsTotal.WithLabelValues(r.Method, helpers.NormalizePath(r.URL.Path), "200").Inc()
	})
}

// initializeMetrics populates metrics with current values from the database
func initializeMetrics() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get total number of quizzes
	count, err := helpers.Client.Database("data-feed-db").Collection("quizzes").CountDocuments(ctx, bson.M{})
	if err != nil {
		log.Printf("Error counting quizzes: %v", err)
		return
	}

	// Set the active evaluations gauge to the current count
	metrics.ActiveEvaluations.Set(float64(count))
	log.Printf("Initialized metrics with %d active evaluations", count)
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Register metrics
	metrics.RegisterMetrics()

	r := mux.NewRouter()
	helpers.InitMongoClient()

	// Initialize metrics with current values
	initializeMetrics()

	// Prometheus metrics endpoint
	r.Handle("/evaluation/metrics", metrics.GetHandler()).Methods("GET")

	// Apply Prometheus middleware to all routes
	r.Use(prometheusMiddleware)

	cors := gorillaHandlers.CORS(
		gorillaHandlers.AllowedOrigins([]string{"*"}),
		gorillaHandlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		gorillaHandlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)

	// POST /evaluation/quiz
	r.HandleFunc("/evaluation/quiz", handlers.CreateQuiz).Methods("POST")

	// GET /evaluation/quiz
	r.HandleFunc("/evaluation/quiz", handlers.GetAllQuizzes).Methods("GET")

	// GET /evaluation/quiz/{id}
	r.HandleFunc("/evaluation/quiz/{id}", handlers.UpdateQuiz).Methods("PUT")

	// DELETE /evaluation/quiz/{id}
	r.HandleFunc("/evaluation/quiz/{id}", handlers.DeleteQuiz).Methods("DELETE")

	// GET /evaluation/quiz/class/{class_id}
	r.HandleFunc("/evaluation/quiz/class/{class_id}", handlers.GetQuizzesByClass).Methods("GET")

	// GET /evaluation/quiz/user/{user_id}
	r.HandleFunc("/evaluation/quiz/{quiz_id}", handlers.GetQuizByID).Methods("GET")

	// GET /evaluation/quiz/meta/{id}
	r.HandleFunc("/evaluation/quiz/meta/{quiz_id}", handlers.GetQuizMeta).Methods("GET")

	// Protected routes
	r.Handle("/evaluation/quiz/attempt/{quizId}", middleware.JWTAuth(http.HandlerFunc(handlers.GetQuizForAttempt))).Methods("GET")

	// POST /evaluation/quiz/attempt/{quizId}
	r.Handle("/evaluation/quiz/attempt/{quizId}", middleware.JWTAuth(http.HandlerFunc(handlers.SubmitAttempt))).Methods("POST")

	// POST /evaluation/quiz/{quizId}/result
	r.Handle("/evaluation/quiz/{quizId}/result/{userId}", middleware.JWTAuth(http.HandlerFunc(handlers.GetLastResult))).Methods("GET")

	// POST /evaluation/quiz/{quizId}/results
	r.Handle("/evaluation/quiz/{quizId}/results", middleware.JWTAuth(http.HandlerFunc(handlers.GetQuizResults))).Methods("GET")

	// POST /evaluation/quiz/{quizId}/results
	r.Handle("/evaluation/quiz/{id}/status", middleware.JWTAuth(http.HandlerFunc(handlers.SetQuizStatus))).Methods("PUT")

	log.Println("evaluation-service running on :8080")
	http.ListenAndServe(":8080", cors(r))
}
