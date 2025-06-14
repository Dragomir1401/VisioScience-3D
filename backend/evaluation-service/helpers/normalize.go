package helpers

import (
	"context"
	"log"
	"regexp"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var idPattern = regexp.MustCompile(`/[0-9a-fA-F]{24}`)

func NormalizePath(path string) string {
	return idPattern.ReplaceAllString(path, "/{id}")
}

// EnsureQuestionIDs adds IDs to questions that don't have them
func EnsureQuestionIDs() error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	collection := Client.Database("data-feed-db").Collection("quizzes")
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var quiz struct {
			ID        primitive.ObjectID `bson:"_id"`
			Questions []struct {
				ID     primitive.ObjectID `bson:"_id,omitempty"`
				Text   string             `bson:"text"`
				Points int                `bson:"points"`
			} `bson:"questions"`
		}

		if err := cursor.Decode(&quiz); err != nil {
			log.Printf("Error decoding quiz: %v", err)
			continue
		}

		modified := false
		for i := range quiz.Questions {
			if quiz.Questions[i].ID.IsZero() {
				quiz.Questions[i].ID = primitive.NewObjectID()
				modified = true
			}
		}

		if modified {
			_, err := collection.UpdateOne(
				ctx,
				bson.M{"_id": quiz.ID},
				bson.M{"$set": bson.M{"questions": quiz.Questions}},
			)
			if err != nil {
				log.Printf("Error updating quiz %s: %v", quiz.ID.Hex(), err)
			} else {
				log.Printf("Updated quiz %s with question IDs", quiz.ID.Hex())
			}
		}
	}

	return nil
}
