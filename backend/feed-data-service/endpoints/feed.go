package endpoints

import (
	"encoding/json"
	"net/http"

	"feed-data-service/helpers"
	"feed-data-service/models"

	"github.com/gorilla/mux"
	"github.com/prometheus/client_golang/prometheus"
)

var (
	feedOperations = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "feed_operations_total",
			Help: "Total number of feed operations",
		},
		[]string{"operation", "shape"},
	)

	activeFeeds = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "active_feeds",
			Help: "Number of active feeds",
		},
	)
)

func init() {
	prometheus.MustRegister(feedOperations)
	prometheus.MustRegister(activeFeeds)
}

func CreateFeed(w http.ResponseWriter, r *http.Request) {
	var feed models.Feed
	if err := json.NewDecoder(r.Body).Decode(&feed); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := helpers.CreateFeed(feed); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	feedOperations.WithLabelValues("create", feed.Shape).Inc()
	activeFeeds.Inc()

	w.WriteHeader(http.StatusCreated)
}

func GetFeedByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	feed, err := helpers.GetFeedByID(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	feedOperations.WithLabelValues("get", feed.Shape).Inc()

	json.NewEncoder(w).Encode(feed)
}

func UpdateFeedByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var feed models.Feed
	if err := json.NewDecoder(r.Body).Decode(&feed); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := helpers.UpdateFeedByID(id, feed); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	feedOperations.WithLabelValues("update", feed.Shape).Inc()

	w.WriteHeader(http.StatusOK)
}

func DeleteFeedByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	feed, err := helpers.GetFeedByID(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	if err := helpers.DeleteFeedByID(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	feedOperations.WithLabelValues("delete", feed.Shape).Inc()
	activeFeeds.Dec()

	w.WriteHeader(http.StatusOK)
}

func GetFeedsByShape(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	shape := vars["shape"]

	feeds, err := helpers.GetFeedsByShape(shape)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	feedOperations.WithLabelValues("list", shape).Inc()

	json.NewEncoder(w).Encode(feeds)
}
