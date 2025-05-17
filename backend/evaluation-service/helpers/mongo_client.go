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
	Client, err = mongo.Connect(context.TODO(),
		options.Client().ApplyURI(mongoUri),
	)
	if err != nil {
		panic(err)
	}

	context := context.Background()
	if err = Client.Ping(context, nil); err != nil {
		panic(err)
	}
	log.Println("Connected to MongoDB!")
}
