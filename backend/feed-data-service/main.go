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
		if r.URL.Path == "/feed/metrics" {
			next.ServeHTTP(w, r)
			return
		}

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
	metrics.RegisterMetrics()

	r := mux.NewRouter()

	r.Handle("/feed/metrics", metrics.GetHandler()).Methods("GET")

	r.Use(prometheusMiddleware)

	helpers.InitMongoClient()
	initActiveMoleculesGauge()
	initActiveFeedsGauge()

	corsObj := gorillaHandlers.CORS(
		gorillaHandlers.AllowedOrigins([]string{"*"}),
		gorillaHandlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		gorillaHandlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)

	r.HandleFunc("/feed", handlers.CreateFeed).Methods("POST")
	r.HandleFunc("/feed/{id}", handlers.GetFeedByID).Methods("GET")
	r.HandleFunc("/feed/{id}", handlers.UpdateFeedByID).Methods("PUT")
	r.HandleFunc("/feed/{id}", handlers.DeleteFeedByID).Methods("DELETE")
	r.HandleFunc("/feed/shape/{shape}", handlers.GetFeedsByShape).Methods("GET")
	r.HandleFunc("/feed/chem/molecules", handlers.GetAllMolecules).Methods("GET")
	r.HandleFunc("/feed/chem/molecules", handlers.CreateMolecule).Methods("POST")
	r.HandleFunc("/feed/chem/molecules/{id}", handlers.GetMoleculeByID).Methods("GET")
	r.HandleFunc("/feed/chem/molecules/{id}", handlers.UpdateMolecule).Methods("PUT")
	r.HandleFunc("/feed/chem/molecules/{id}", handlers.DeleteMolecule).Methods("DELETE")
	r.HandleFunc("/feed/chem/molecules/{id}/3d", handlers.GetMolecule3D).Methods("GET")

	r.HandleFunc("/feed/chem/elements", handlers.GetAllElements).Methods("GET")
	r.HandleFunc("/feed/chem/elements", handlers.CreateElement).Methods("POST")
	r.HandleFunc("/feed/chem/elements/{symbol}", handlers.GetElementBySymbol).Methods("GET")
	r.HandleFunc("/feed/chem/elements/group/{group}", handlers.GetElementsByGroup).Methods("GET")
	r.HandleFunc("/feed/chem/elements/period/{period}", handlers.GetElementsByPeriod).Methods("GET")

	log.Println("feed-data-service running on :8080")
	if err := http.ListenAndServe(":8080", corsObj(r)); err != nil {
		log.Fatal(err)
	}
}
