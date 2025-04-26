package main

import (
	"log"
	"net/http"

	handlers "evaluation-service/endpoints"
	helpers "evaluation-service/helpers"

	gorillaHandlers "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func main() {
	r := mux.NewRouter()
	helpers.InitMongoClient()

	// CORS middleware to accept all origins for development purposes
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
	r.HandleFunc("/evaluation/quiz/meta/{id}", handlers.GetQuizMeta).Methods("GET")

	// POST /evaluation/quiz/{quizId}/attempt
	r.HandleFunc("/evaluation/quiz/{quizId}/result/{userId}", handlers.GetLastResult).Methods("GET")

	// GET /evaluation/quiz/attempt/{quizId}
	r.HandleFunc("/evaluation/quiz/attempt/{quizId}", handlers.GetQuizForAttempt).Methods("GET")

	// POST /evaluation/quiz/attempt/{quizId}
	r.HandleFunc("/evaluation/quiz/attempt/{quizId}", handlers.SubmitAttempt).Methods("POST")

	log.Println("evaluation-service running on :8080")
	http.ListenAndServe(":8080", cors(r))
}
