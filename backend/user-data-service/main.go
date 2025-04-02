package main

import (
	"log"
	"net/http"

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

	secured := r.PathPrefix("/auth").Subrouter()
	secured.Use(middleware.JWTAuth)
	secured.HandleFunc("/user/me", endpoints.GetMe).Methods("GET")

	log.Println("User-Data-Service running on port 8081...")
	if err := http.ListenAndServe(":8081", r); err != nil {
		log.Fatal(err)
	}
}
