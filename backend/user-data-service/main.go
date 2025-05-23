package main

import (
	"context"
	"log"
	"net/http"
	"regexp"

	gorillaHandlers "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/prometheus/client_golang/prometheus"
	"go.mongodb.org/mongo-driver/bson"

	handlers "user-data-service/endpoints"
	"user-data-service/metrics"
	middleware "user-data-service/middleware"
	mongo "user-data-service/mongo"
	"user-data-service/utils"
)

var idPattern = regexp.MustCompile(`/[0-9a-fA-F]{24}`)

func prometheusMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/user/metrics" {
			next.ServeHTTP(w, r)
			return
		}
		timer := prometheus.NewTimer(metrics.HTTPRequestDuration.WithLabelValues(r.Method, utils.NormalizePath(r.URL.Path)))
		next.ServeHTTP(w, r)
		timer.ObserveDuration()
		metrics.HTTPRequestsTotal.WithLabelValues(r.Method, utils.NormalizePath(r.URL.Path), "200").Inc()
	})
}

func initActiveUsersGauge() {
	collection := mongo.UserCollection
	count, err := collection.CountDocuments(context.Background(), bson.M{})
	if err == nil {
		metrics.ActiveUsers.Set(float64(count))
	}
}

func initActiveInvitesGauge() {
	collection := mongo.InviteCollection
	count, err := collection.CountDocuments(context.Background(), bson.M{})
	if err == nil {
		metrics.ActiveInvites.Set(float64(count))
	}
}

func initActiveClassesGauge() {
	collection := mongo.ClassCollection
	count, err := collection.CountDocuments(context.Background(), bson.M{})
	if err == nil {
		metrics.ActiveClasses.Set(float64(count))
	}
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	mongo.InitDB()

	// Register metrics
	metrics.RegisterMetrics()
	initActiveUsersGauge()
	initActiveInvitesGauge()
	initActiveClassesGauge()

	r := mux.NewRouter()

	// Prometheus metrics endpoint
	r.Handle("/user/metrics", metrics.GetHandler()).Methods("GET")

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
