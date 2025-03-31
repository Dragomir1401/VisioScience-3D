package db

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var MongoClient *mongo.Client
var UserCollection *mongo.Collection

func InitDB() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx,
		options.Client().ApplyURI("mongodb://root:root@mongo-user-data-service:27017/?authSource=admin"),
	)
	if err != nil {
		log.Fatal("Cannot connect to user-data Mongo:", err)
	}

	if err = client.Ping(ctx, nil); err != nil {
		log.Fatal("Cannot ping user-data Mongo:", err)
	}

	log.Println("Connected to user-data Mongo!")

	MongoClient = client
	UserCollection = client.Database("userdata").Collection("users")
}
