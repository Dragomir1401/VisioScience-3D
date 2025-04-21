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
		gorillaHandlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE"}),
		gorillaHandlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)

	r.HandleFunc("/evaluation/quiz", handlers.CreateQuiz).Methods("POST")
	r.HandleFunc("/evaluation/quiz", handlers.GetAllQuizzes).Methods("GET")
	r.HandleFunc("/evaluation/quiz/{id}", handlers.UpdateQuiz).Methods("PUT")
	r.HandleFunc("/evaluation/quiz/{id}", handlers.DeleteQuiz).Methods("DELETE")
	r.HandleFunc("/evaluation/quiz/class/{class_id}", handlers.GetQuizzesByClass).Methods("GET")

	log.Println("evaluation-service running on :8080")
	http.ListenAndServe(":8080", cors(r))
}
