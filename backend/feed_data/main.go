package main

import (
	"log"
	"net/http"

	"formulas_service/handlers"

	"github.com/gorilla/mux"
)

func main() {
    r := mux.NewRouter()

    r.HandleFunc("/feed/formulas/{shape}", handlers.GetFormulas).Methods("GET")

    r.HandleFunc("/feed/formulas/{shape}", handlers.CreateFormula).Methods("POST")

    log.Println("Feed-data server running on port 8080...")
    if err := http.ListenAndServe(":8080", r); err != nil {
        log.Fatal(err)
    }
}