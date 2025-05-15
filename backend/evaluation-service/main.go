package main

import (
	"log"
	"net/http"

	handlers "evaluation-service/endpoints"
	helpers "evaluation-service/helpers"
	"evaluation-service/middleware"

	gorillaHandlers "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
	httpRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "evaluation_http_requests_total",
			Help: "Total number of HTTP requests to evaluation service",
		},
		[]string{"method", "endpoint", "status"},
	)

	httpRequestDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "evaluation_http_request_duration_seconds",
			Help:    "Duration of HTTP requests to evaluation service",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "endpoint"},
	)

	activeQuizzes = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "active_quizzes",
			Help: "Number of active quizzes",
		},
	)

	quizAttempts = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "quiz_attempts_total",
			Help: "Total number of quiz attempts",
		},
		[]string{"quiz_id", "status"},
	)

	quizResults = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "quiz_results",
			Help:    "Distribution of quiz results",
			Buckets: []float64{0, 20, 40, 60, 80, 100},
		},
		[]string{"quiz_id"},
	)

	quizOperations = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "quiz_operations_total",
			Help: "Total number of quiz operations",
		},
		[]string{"operation", "class_id"},
	)
)

func init() {
	prometheus.MustRegister(httpRequestsTotal)
	prometheus.MustRegister(httpRequestDuration)
	prometheus.MustRegister(activeQuizzes)
	prometheus.MustRegister(quizAttempts)
	prometheus.MustRegister(quizResults)
	prometheus.MustRegister(quizOperations)
}

func prometheusMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := prometheus.NewTimer(httpRequestDuration.WithLabelValues(r.Method, r.URL.Path))
		next.ServeHTTP(w, r)
		start.ObserveDuration()
		httpRequestsTotal.WithLabelValues(r.Method, r.URL.Path, "200").Inc()
	})
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	r := mux.NewRouter()
	helpers.InitMongoClient()

	// Prometheus metrics endpoint
	r.Handle("/metrics", promhttp.Handler()).Methods("GET")

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
