package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type Formula struct {
	Shape   string `json:"shape"`
	Content string `json:"content"`
}

func GetFormulaHandler(collection *mongo.Collection) gin.HandlerFunc {
	return func(c *gin.Context) {
		shape := c.Param("shape")

		var result Formula

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		err := collection.FindOne(ctx, bson.M{"shape": shape}).Decode(&result)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Formula not found"})
			return
		}

		c.JSON(http.StatusOK, result)
	}
}
