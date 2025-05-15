package handlers

import (
	"context"
	"encoding/json"
	helpers "feed-data-service/helpers"
	"feed-data-service/models"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/prometheus/client_golang/prometheus"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var (
	formulaOperations = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "formula_operations_total",
			Help: "Total number of formula operations",
		},
		[]string{"operation", "shape"},
	)

	activeFormulas = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "active_formulas",
			Help: "Number of active formulas",
		},
	)
)

func init() {
	prometheus.MustRegister(formulaOperations)
	prometheus.MustRegister(activeFormulas)
}

// CreateFeed - POST /feeds
func CreateFeed(w http.ResponseWriter, r *http.Request) {
	log.Println("[CreateFeed] Received request to create a new feed")
	w.Header().Set("Content-Type", "application/json")
	var feed models.Feed

	if err := json.NewDecoder(r.Body).Decode(&feed); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	feed.Metadata.CreatedAt = time.Now()
	if feed.Metadata.Name == "" {
		feed.Metadata.Name = "default_feed"
	}

	collection := helpers.Client.Database("data-feed-db").Collection("formulas")

	result, err := collection.InsertOne(context.Background(), feed)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	insertedID, ok := result.InsertedID.(primitive.ObjectID)
	if !ok {
		http.Error(w, "Failed to cast insertedID to ObjectID", http.StatusInternalServerError)
		return
	}

	formulaOperations.WithLabelValues("create", feed.Formula.Shape).Inc()
	activeFormulas.Inc()

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Created",
		"id":      insertedID.Hex(),
	})
}

// GetFeedByID - GET /feeds/{id}
func GetFeedByID(w http.ResponseWriter, r *http.Request) {
	log.Println("[GetFeedByID] Received request to get feed by ID")
	w.Header().Set("Content-Type", "application/json")
	idStr := mux.Vars(r)["id"]

	objID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	collection := helpers.Client.Database("data-feed-db").Collection("formulas")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var feed models.Feed
	err = collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&feed)
	if err == mongo.ErrNoDocuments {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	formulaOperations.WithLabelValues("get", feed.Formula.Shape).Inc()

	json.NewEncoder(w).Encode(feed)
}

// UpdateFeedByID - PUT /feeds/{id}
func UpdateFeedByID(w http.ResponseWriter, r *http.Request) {
	log.Println("[UpdateFeedByID] Received request to update feed by ID")
	w.Header().Set("Content-Type", "application/json")
	idStr := mux.Vars(r)["id"]

	objID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	var updatedFeed models.Feed
	if err := json.NewDecoder(r.Body).Decode(&updatedFeed); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	updatedFeed.Metadata.CreatedAt = time.Now()

	collection := helpers.Client.Database("data-feed-db").Collection("formulas")

	update := bson.M{"$set": bson.M{
		"formula":  updatedFeed.Formula,
		"metadata": updatedFeed.Metadata,
	}}

	result, err := collection.UpdateOne(context.Background(), bson.M{"_id": objID}, update)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}

	formulaOperations.WithLabelValues("update", updatedFeed.Formula.Shape).Inc()

	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":        "Updated",
		"matched_count":  result.MatchedCount,
		"modified_count": result.ModifiedCount,
	})
}

// DeleteFeedByID - DELETE /feeds/{id}
func DeleteFeedByID(w http.ResponseWriter, r *http.Request) {
	log.Println("[DeleteFeedByID] Received request to delete feed by ID")
	w.Header().Set("Content-Type", "application/json")
	idStr := mux.Vars(r)["id"]

	objID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	collection := helpers.Client.Database("data-feed-db").Collection("formulas")
	result, err := collection.DeleteOne(context.Background(), bson.M{"_id": objID})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}

	formulaOperations.WithLabelValues("delete", "formula").Inc()
	activeFormulas.Dec()

	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":       "Deleted",
		"deleted_count": result.DeletedCount,
	})
}

// GetFeedsByShape - GET /feeds/shape/{shape}
func GetFeedsByShape(w http.ResponseWriter, r *http.Request) {
	log.Println("[GetFeedsByShape] Received request to get feeds by shape")
	w.Header().Set("Content-Type", "application/json")
	shape := mux.Vars(r)["shape"]
	log.Printf("Finding all feeds with shape: %s", shape)

	collection := helpers.Client.Database("data-feed-db").Collection("formulas")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{"formula.shape": shape})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var feeds []models.Feed
	if err := cursor.All(ctx, &feeds); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	formulaOperations.WithLabelValues("list", shape).Inc()

	json.NewEncoder(w).Encode(feeds)
}
