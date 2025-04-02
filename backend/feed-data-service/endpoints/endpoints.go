package handlers

import (
	"context"
	"encoding/json"
	"feed-data-service/models"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var client *mongo.Client

func init() {
	var err error
	client, err = mongo.Connect(context.TODO(),
		options.Client().ApplyURI("mongodb://root:root@mongo-feed-data-service:27017"),
	)
	if err != nil {
		panic(err)
	}
	if err = client.Ping(context.TODO(), nil); err != nil {
		panic(err)
	}
	log.Println("Connected to MongoDB!")
}

// CreateFeed - POST /feeds
func CreateFeed(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var feed models.Feed

	if err := json.NewDecoder(r.Body).Decode(&feed); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	feed.Metadata.CreatedAt = time.Now().Format(time.RFC3339)
	if feed.Metadata.Name == "" {
		feed.Metadata.Name = "default_feed"
	}

	collection := client.Database("data-feed-db").Collection("formulas")

	result, err := collection.InsertOne(context.TODO(), feed)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	insertedID, ok := result.InsertedID.(primitive.ObjectID)
	if !ok {
		http.Error(w, "Failed to cast insertedID to ObjectID", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Created",
		"id":      insertedID.Hex(),
	})
}

// GetFeedByID - GET /feeds/{id}
func GetFeedByID(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	idStr := mux.Vars(r)["id"]

	objID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	collection := client.Database("data-feed-db").Collection("formulas")
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

	json.NewEncoder(w).Encode(feed)
}

// UpdateFeedByID - PUT /feeds/{id}
func UpdateFeedByID(w http.ResponseWriter, r *http.Request) {
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

	updatedFeed.Metadata.CreatedAt = time.Now().Format(time.RFC3339)

	collection := client.Database("data-feed-db").Collection("formulas")

	update := bson.M{"$set": bson.M{
		"formula":  updatedFeed.Formula,
		"metadata": updatedFeed.Metadata,
	}}

	result, err := collection.UpdateOne(context.TODO(), bson.M{"_id": objID}, update)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":        "Updated",
		"matched_count":  result.MatchedCount,
		"modified_count": result.ModifiedCount,
	})
}

// DeleteFeedByID - DELETE /feeds/{id}
func DeleteFeedByID(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	idStr := mux.Vars(r)["id"]

	objID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	collection := client.Database("data-feed-db").Collection("formulas")
	result, err := collection.DeleteOne(context.TODO(), bson.M{"_id": objID})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":       "Deleted",
		"deleted_count": result.DeletedCount,
	})
}

// (Opțional) GetFeedsByShape - GET /feeds/shape/{shape}
func GetFeedsByShape(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	shape := mux.Vars(r)["shape"]
	log.Printf("Finding all feeds with shape: %s", shape)

	collection := client.Database("data-feed-db").Collection("formulas")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Filtrăm după formula.shape
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

	json.NewEncoder(w).Encode(feeds)
}
