package main

import (
	"log"
	"net/http"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"

	endpoints "user-data-service/endpoints"
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

	r.HandleFunc("/user/auth/register", endpoints.Register).Methods("POST")
	r.HandleFunc("/user/auth/login", endpoints.Login).Methods("POST")
	r.Handle("/user/me", middleware.JWTAuth(http.HandlerFunc(endpoints.GetMe)))

	corsObj := handlers.CORS(
		handlers.AllowedOrigins([]string{"*"}), // Allow all origins for development purposes
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)

	log.Println("User-Data-Service running on port 8081...")
	if err := http.ListenAndServe(":8081", corsObj(r)); err != nil {
		log.Fatal(err)
	}
}
