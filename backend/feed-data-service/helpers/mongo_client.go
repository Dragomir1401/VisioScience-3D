package mongo_client

import (
	"context"
	"log"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client

func InitMongoClient() {
	var err error
	Client, err = mongo.Connect(context.TODO(), options.Client().ApplyURI("..."))
	if err != nil {
		panic(err)
	}
	if err = Client.Ping(context.TODO(), nil); err != nil {
		panic(err)
	}
	log.Println("Connected to Mongo!")
}
