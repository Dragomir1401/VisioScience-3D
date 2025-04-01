package main

import (
    "log"
    "net/http"

    "github.com/gorilla/mux"

    "user-data-service/endpoints"
    "user-data-service/mongo"
    "user-data-service/middleware"
)

func main() {
    mongo.InitDB()

    r := mux.NewRouter()

    r.HandleFunc("/auth/register", endpoints.Register).Methods("POST")
    r.HandleFunc("/auth/login", endpoints.Login).Methods("POST")

    secured := r.PathPrefix("/auth").Subrouter()
    secured.Use(middleware.JWTAuth) 
    secured.HandleFunc("/me", endpoints.GetMe).Methods("GET")

    log.Println("User-Data-Service running on port 8081...")
    if err := http.ListenAndServe(":8081", r); err != nil {
        log.Fatal(err)
    }
}
