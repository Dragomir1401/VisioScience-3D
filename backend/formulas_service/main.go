package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"formulas_service/handlers"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	mongoURI := "mongodb://mongodb-service.default.svc.cluster.local:27017"
	clientOptions := options.Client().ApplyURI(mongoURI)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatalf("MongoDB connection error: %v", err)
	}

	db := client.Database("formulasdb")
	formulasCollection := db.Collection("formulas")

	router := gin.Default()

	// Inject collection into handler
	router.GET("/formulas/:shape", handlers.GetFormulaHandler(formulasCollection))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	router.Run(":" + port)
}
