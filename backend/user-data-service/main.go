package main

import (
	"log"
	"net/http"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"

	endpoints "user-data-service/endpoints"
	middleware "user-data-service/middleware"
	mongo "user-data-service/mongo"
)

func main() {
	mongo.InitDB()

	r := mux.NewRouter()

	r.HandleFunc("/user/auth/register", endpoints.Register).Methods("POST")
	r.HandleFunc("/user/auth/login", endpoints.Login).Methods("POST")

	secured := r.PathPrefix("/user/auth").Subrouter()
	secured.Use(middleware.JWTAuth)
	secured.HandleFunc("/me", endpoints.GetMe).Methods("GET")

	corsObj := handlers.CORS(
		handlers.AllowedOrigins([]string{"http://localhost:5173"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)

	log.Println("User-Data-Service running on port 8081...")
	if err := http.ListenAndServe(":8081", corsObj(r)); err != nil {
		log.Fatal(err)
	}
}
