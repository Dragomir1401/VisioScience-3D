package main

import (
	"log"
	"net/http"

	handlers "feed-data-service/endpoints"

	"github.com/gorilla/mux"
)

func main() {
	r := mux.NewRouter()

	r.HandleFunc("/feed/router", handlers.CreateFeed).Methods("POST")
	r.HandleFunc("/feed/router/{id}", handlers.GetFeedByID).Methods("GET")
	r.HandleFunc("/feed/router/{id}", handlers.UpdateFeedByID).Methods("PUT")
	r.HandleFunc("/feed/router/{id}", handlers.DeleteFeedByID).Methods("DELETE")

	r.HandleFunc("/feed/router/shape/{shape}", handlers.GetFeedsByShape).Methods("GET")

	log.Println("Feed-data server router running on port 8080...")
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatal(err)
	}
}
