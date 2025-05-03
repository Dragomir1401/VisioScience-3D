package main

import (
	"log"
	"net/http"

	gorillaHandlers "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"

	handlers "user-data-service/endpoints"
	middleware "user-data-service/middleware"
	mongo "user-data-service/mongo"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	mongo.InitDB()

	r := mux.NewRouter()

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
