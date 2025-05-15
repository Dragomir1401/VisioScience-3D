package main

import (
	"log"
	"net/http"

	gorillaHandlers "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"

	handlers "user-data-service/endpoints"
	middleware "user-data-service/middleware"
	mongo "user-data-service/mongo"
)

var (
	httpRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total number of HTTP requests",
		},
		[]string{"method", "endpoint", "status"},
	)

	httpRequestDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "Duration of HTTP requests",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "endpoint"},
	)

	activeUsers = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "active_users",
			Help: "Number of active users",
		},
	)

	activeClasses = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "active_classes",
			Help: "Number of active classes",
		},
	)
)

func init() {
	prometheus.MustRegister(httpRequestsTotal)
	prometheus.MustRegister(httpRequestDuration)
	prometheus.MustRegister(activeUsers)
	prometheus.MustRegister(activeClasses)
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
	mongo.InitDB()

	r := mux.NewRouter()

	// Prometheus metrics endpoint
	r.Handle("/metrics", promhttp.Handler()).Methods("GET")

	// Apply Prometheus middleware to all routes
	r.Use(prometheusMiddleware)

	r.HandleFunc("/user/auth/register", handlers.Register).Methods("POST")
	r.HandleFunc("/user/auth/login", handlers.Login).Methods("POST")
	r.Handle("/user/me", middleware.JWTAuth(http.HandlerFunc(handlers.GetMe)))

	r.Handle("/user/classes", middleware.JWTAuth(http.HandlerFunc(handlers.CreateClass))).Methods("POST")
	r.Handle("/user/classes", middleware.JWTAuth(http.HandlerFunc(handlers.ListMyClasses))).Methods("GET")

	r.Handle("/user/classes/{code}/join", middleware.JWTAuth(http.HandlerFunc(handlers.JoinClass))).Methods("POST")
	r.Handle("/user/class/add-student", middleware.JWTAuth(http.HandlerFunc(handlers.AddStudentToClass))).Methods("POST")
	r.Handle("/user/classes/{id}/students", middleware.JWTAuth(http.HandlerFunc(handlers.GetClassStudents))).Methods("GET")
	r.Handle("/user/classes/{id}/students/{studentId}", middleware.JWTAuth(http.HandlerFunc(handlers.RemoveStudentFromClass))).Methods("DELETE")

	r.Handle("/user/classes/{id}/invite", middleware.JWTAuth(http.HandlerFunc(handlers.SendInvite))).Methods("POST")
	r.Handle("/user/invites", middleware.JWTAuth(http.HandlerFunc(handlers.GetMyInvites))).Methods("GET")
	r.Handle("/user/invites/{id}/respond", middleware.JWTAuth(http.HandlerFunc(handlers.RespondToInvite))).Methods("POST")

	r.Handle("/user/quiz/result", middleware.JWTAuth(http.HandlerFunc(handlers.SubmitUserQuizResult))).Methods("POST")
	r.Handle("/user/quiz/results/{quizId}", middleware.JWTAuth(http.HandlerFunc(handlers.GetUserQuizResult))).Methods("GET")
	r.Handle("/user/classes/{classId}/quiz/{quizId}/results", middleware.JWTAuth(http.HandlerFunc(handlers.GetClassQuizResults))).Methods("GET")
	r.Handle("/user/classes/{id}", middleware.JWTAuth(http.HandlerFunc(handlers.DeleteClass))).Methods("DELETE")

	corsObj := gorillaHandlers.CORS(
		gorillaHandlers.AllowedOrigins([]string{"*"}),
		gorillaHandlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		gorillaHandlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)

	log.Println("User-Data-Service running on port 8081...")
	if err := http.ListenAndServe(":8081", corsObj(r)); err != nil {
		log.Fatal(err)
	}
}
