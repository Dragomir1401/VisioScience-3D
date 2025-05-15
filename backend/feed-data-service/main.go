package main

import (
	"log"
	"net/http"

	handlers "feed-data-service/endpoints"
	helpers "feed-data-service/helpers"

	gorillaHandlers "github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
	httpRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "feed_http_requests_total",
			Help: "Total number of HTTP requests to feed service",
		},
		[]string{"method", "endpoint", "status"},
	)

	httpRequestDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "feed_http_request_duration_seconds",
			Help:    "Duration of HTTP requests to feed service",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "endpoint"},
	)

	activeFeeds = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "active_feeds",
			Help: "Number of active feeds",
		},
	)

	activeMolecules = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "active_molecules",
			Help: "Number of active molecules",
		},
	)

	feedOperations = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "feed_operations_total",
			Help: "Total number of feed operations",
		},
		[]string{"operation", "shape"},
	)

	moleculeOperations = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "molecule_operations_total",
			Help: "Total number of molecule operations",
		},
		[]string{"operation"},
	)
)

func init() {
	prometheus.MustRegister(httpRequestsTotal)
	prometheus.MustRegister(httpRequestDuration)
	prometheus.MustRegister(activeFeeds)
	prometheus.MustRegister(activeMolecules)
	prometheus.MustRegister(feedOperations)
	prometheus.MustRegister(moleculeOperations)
}

func prometheusMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := prometheus.NewTimer(httpRequestDuration.WithLabelValues(r.Method, r.URL.Path))
		next.ServeHTTP(w, r)
		start.ObserveDuration()
		httpRequestsTotal.WithLabelValues(r.Method, r.URL.Path, "200").Inc()
	})
}

func main() {
	r := mux.NewRouter()

	// Prometheus metrics endpoint
	r.Handle("/metrics", promhttp.Handler()).Methods("GET")

	// Apply Prometheus middleware to all routes
	r.Use(prometheusMiddleware)

	// init mongo client
	helpers.InitMongoClient()

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
