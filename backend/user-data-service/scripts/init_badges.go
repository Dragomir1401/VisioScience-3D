package main

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"user-data-service/models"
)

func main() {
	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI("mongodb://mongodb:27017"))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect(context.Background())

	db := client.Database("user-data-db")

	badges := []models.Badge{
		{
			ID:          primitive.NewObjectID(),
			Title:       "Primul Quiz",
			Description: "Completează primul quiz",
			Type:        "BronzeBadge",
			Icon:        "🎯",
			CreatedAt:   time.Now(),
		},
		{
			ID:          primitive.NewObjectID(),
			Title:       "Quiz Master",
			Description: "Completează 5 quiz-uri",
			Type:        "SilverBadge",
			Icon:        "🏆",
			CreatedAt:   time.Now(),
		},
		{
			ID:          primitive.NewObjectID(),
			Title:       "Expert",
			Description: "Completează 10 quiz-uri cu scor peste 80%",
			Type:        "GoldBadge",
			Icon:        "🌟",
			CreatedAt:   time.Now(),
		},
		{
			ID:          primitive.NewObjectID(),
			Title:       "Perfect Score",
			Description: "Obține un scor perfect la orice quiz",
			Type:        "PerfectBadge",
			Icon:        "💯",
			CreatedAt:   time.Now(),
		},
	}

	var badgeDocs []interface{}
	for _, badge := range badges {
		badgeDocs = append(badgeDocs, badge)
	}

	result, err := db.Collection("badges").InsertMany(context.Background(), badgeDocs)
	if err != nil {
		log.Fatal(err)
	}

	log.Printf("Successfully inserted %d badges", len(result.InsertedIDs))
	for i, id := range result.InsertedIDs {
		log.Printf("Badge %d: %s - %s", i+1, id, badges[i].Title)
	}
}
