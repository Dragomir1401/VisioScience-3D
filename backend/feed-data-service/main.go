package main

import (
	"log"
	"net/http"

	"context"
	handlers "feed-data-service/endpoints"
	helpers "feed-data-service/helpers"
	"feed-data-service/metrics"

	gorillaHandlers "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/prometheus/client_golang/prometheus"
	"go.mongodb.org/mongo-driver/bson"
)

func prometheusMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := prometheus.NewTimer(metrics.HTTPRequestDuration.WithLabelValues(r.Method, helpers.NormalizePath(r.URL.Path)))
		next.ServeHTTP(w, r)
		start.ObserveDuration()
		metrics.HTTPRequestsTotal.WithLabelValues(r.Method, helpers.NormalizePath(r.URL.Path), "200").Inc()
	})
}

func initActiveMoleculesGauge() {
	collection := helpers.Client.Database("data-feed-db").Collection("molecules")
	count, err := collection.CountDocuments(context.Background(), bson.M{})
	if err == nil {
		metrics.ActiveMolecules.Set(float64(count))
	}
}

func initActiveFeedsGauge() {
	collection := helpers.Client.Database("data-feed-db").Collection("formulas")
	count, err := collection.CountDocuments(context.Background(), bson.M{})
	if err == nil {
		metrics.ActiveFeeds.Set(float64(count))
	}
}

func main() {
	// Register metrics
	metrics.RegisterMetrics()

	r := mux.NewRouter()

	// Prometheus metrics endpoint
	r.Handle("/feed/metrics", metrics.GetHandler()).Methods("GET")

	// Apply Prometheus middleware to all routes
	r.Use(prometheusMiddleware)

	// init mongo client
	helpers.InitMongoClient()
	initActiveMoleculesGauge()
	initActiveFeedsGauge()

	// CORS middleware to accept all origins for development purposes
	corsObj := gorillaHandlers.CORS(
		gorillaHandlers.AllowedOrigins([]string{"*"}), // Allow all origins for development purposes
		gorillaHandlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		gorillaHandlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)

	// POST /feed
	r.HandleFunc("/feed", handlers.CreateFeed).Methods("POST")
	// GET /feed
	r.HandleFunc("/feed/{id}", handlers.GetFeedByID).Methods("GET")
	// GET /feed
	r.HandleFunc("/feed/{id}", handlers.UpdateFeedByID).Methods("PUT")
	// GET /feed
	r.HandleFunc("/feed/{id}", handlers.DeleteFeedByID).Methods("DELETE")
	// GET /feed
	r.HandleFunc("/feed/shape/{shape}", handlers.GetFeedsByShape).Methods("GET")

	// GET /chem/molecules
	r.HandleFunc("/feed/chem/molecules", handlers.GetAllMolecules).Methods("GET")
	// POST /chem/molecules
	r.HandleFunc("/feed/chem/molecules", handlers.CreateMolecule).Methods("POST")
	// GET /chem/molecules/{id}
	r.HandleFunc("/feed/chem/molecules/{id}", handlers.GetMoleculeByID).Methods("GET")
	// PUT /chem/molecules/{id}
	r.HandleFunc("/feed/chem/molecules/{id}", handlers.UpdateMolecule).Methods("PUT")
	// DELETE /chem/molecules/{id}
	r.HandleFunc("/feed/chem/molecules/{id}", handlers.DeleteMolecule).Methods("DELETE")
	// GET /chem/molecules/{id}/3d
	r.HandleFunc("/feed/chem/molecules/{id}/3d", handlers.GetMolecule3D).Methods("GET")

	log.Println("feed-data-service running on :8080")
	if err := http.ListenAndServe(":8080", corsObj(r)); err != nil {
		log.Fatal(err)
	}
}
