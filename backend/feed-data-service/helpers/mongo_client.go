package helpers

import (
	"context"
	"log"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client
var mongoUri = "mongodb://root:root@mongo-feed-data-service:27017"

func InitMongoClient() {
	var err error
	Client, err = mongo.Connect(context.Background(),
		options.Client().ApplyURI(mongoUri),
	)
	if err != nil {
		panic(err)
	}
	if err = Client.Ping(context.Background(), nil); err != nil {
		panic(err)
	}
	log.Println("Connected to MongoDB!")
}
