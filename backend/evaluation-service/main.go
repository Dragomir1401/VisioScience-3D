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
	helpers.InitMongoClient()

	// Register metrics
	metrics.RegisterMetrics()

	// Initialize metrics with current values
	initializeMetrics()

	r := mux.NewRouter()

	// Prometheus metrics endpoint
	r.Handle("/metrics", metrics.GetHandler()).Methods("GET")

	// Quiz routes
	r.Handle("/evaluation/quiz", middleware.JWTAuth(http.HandlerFunc(handlers.CreateQuiz))).Methods("POST")
	r.Handle("/evaluation/quiz", middleware.JWTAuth(http.HandlerFunc(handlers.GetAllQuizzes))).Methods("GET")
	r.Handle("/evaluation/quiz/{quiz_id}", middleware.JWTAuth(http.HandlerFunc(handlers.GetQuizByID))).Methods("GET")
	r.Handle("/evaluation/quiz/{quiz_id}", middleware.JWTAuth(http.HandlerFunc(handlers.UpdateQuiz))).Methods("PUT")
	r.Handle("/evaluation/quiz/{quiz_id}", middleware.JWTAuth(http.HandlerFunc(handlers.DeleteQuiz))).Methods("DELETE")
	r.Handle("/evaluation/quiz/class/{class_id}", middleware.JWTAuth(http.HandlerFunc(handlers.GetQuizzesByClass))).Methods("GET")
	r.Handle("/evaluation/quiz/meta/{quiz_id}", middleware.JWTAuth(http.HandlerFunc(handlers.GetQuizMeta))).Methods("GET")
	r.Handle("/evaluation/quiz/{quiz_id}/result/{user_id}", middleware.JWTAuth(http.HandlerFunc(handlers.GetLastResult))).Methods("GET")
	r.Handle("/evaluation/quiz/attempt/{quiz_id}", middleware.JWTAuth(http.HandlerFunc(handlers.GetQuizForAttempt))).Methods("GET")
	r.Handle("/evaluation/quiz/attempt/{quiz_id}", middleware.JWTAuth(http.HandlerFunc(handlers.SubmitAttempt))).Methods("POST")
	r.Handle("/evaluation/quiz/{quiz_id}/results", middleware.JWTAuth(http.HandlerFunc(handlers.GetQuizResults))).Methods("GET")
	r.Handle("/evaluation/quiz/{quiz_id}/status", middleware.JWTAuth(http.HandlerFunc(handlers.SetQuizStatus))).Methods("PUT")
	r.Handle("/evaluation/quiz/update-question-ids", middleware.JWTAuth(http.HandlerFunc(handlers.UpdateQuestionIDs))).Methods("POST")
	r.Handle("/evaluation/quiz/add-mock-answers", middleware.JWTAuth(http.HandlerFunc(handlers.AddMockAnswers))).Methods("POST")

	// Protected routes
	r.Handle("/evaluation/quiz/{quiz_id}/statistics", middleware.JWTAuth(http.HandlerFunc(handlers.GetQuizStatistics))).Methods("GET")
	r.Handle("/evaluation/quiz/submit", middleware.JWTAuth(http.HandlerFunc(handlers.SubmitQuizResult))).Methods("POST")

	// POST /evaluation/quiz/{quizId}/statistics
	r.Handle("/evaluation/quiz/{quiz_id}/statistics", middleware.JWTAuth(http.HandlerFunc(handlers.UpdateQuizStatistics))).Methods("POST")

	corsObj := gorillaHandlers.CORS(
		gorillaHandlers.AllowedOrigins([]string{"*"}),
		gorillaHandlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		gorillaHandlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)

	log.Println("evaluation-service running on :8080")
	if err := http.ListenAndServe(":8080", corsObj(r)); err != nil {
		log.Fatal(err)
	}
}
