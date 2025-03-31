package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"

	handlers "user-data-service/endpoints"
	db "user-data-service/mongo"
	// "user-data-service/middleware"  // un JWT middleware
)

func main() {
	// Init conexiune la noua bază user-data
	db.InitDB()

	r := mux.NewRouter()

	// rute publice
	r.HandleFunc("/auth/register", handlers.Register).Methods("POST")
	r.HandleFunc("/auth/login", handlers.Login).Methods("POST")

	// Ex. rute protejate (opțional):
	// subrouter := r.PathPrefix("/auth").Subrouter()
	// subrouter.Use(middleware.JWTAuth) // un exemplu de validare token
	// subrouter.HandleFunc("/me", handlers.GetMe).Methods("GET")

	// Ori direct:
	r.HandleFunc("/auth/me", handlers.GetMe).Methods("GET") // dar trebuie să aplici un JWTAuth

	log.Println("User Data Service running on port 8081")
	if err := http.ListenAndServe(":8081", r); err != nil {
		log.Fatal(err)
	}
}
