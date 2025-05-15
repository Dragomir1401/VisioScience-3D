package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"

	gorillaHandlers "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	r := mux.NewRouter()

	corsObj := gorillaHandlers.CORS(
		gorillaHandlers.AllowedOrigins([]string{"*"}),
		gorillaHandlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		gorillaHandlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)

	// Proxy requests to Grafana
	grafanaURL, err := url.Parse("http://grafana:3000")
	if err != nil {
		log.Fatal("Error parsing Grafana URL:", err)
	}
	grafanaProxy := httputil.NewSingleHostReverseProxy(grafanaURL)
	r.PathPrefix("/grafana/").Handler(http.StripPrefix("/grafana", grafanaProxy))

	// Health check endpoint
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	}).Methods("GET")

	log.Println("Monitoring service running on :8082")
	if err := http.ListenAndServe(":8082", corsObj(r)); err != nil {
		log.Fatal(err)
	}
}
