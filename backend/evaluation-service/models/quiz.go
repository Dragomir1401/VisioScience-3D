package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Quiz struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	Title       string             `bson:"title"`
	ClassID     primitive.ObjectID `bson:"class_id"`
	OwnerID     primitive.ObjectID `bson:"owner_id"`
	Questions   []Question         `bson:"questions"`
	QuizResults []QuizResult       `bson:"quiz_results"`
	CreatedAt   time.Time          `bson:"created_at"`
}

type QuizInput struct {
	Title     string     `json:"title"`
	ClassID   string     `json:"class_id"`
	OwnerID   string     `json:"owner_id"`
	Questions []Question `json:"questions"`
}

type Question struct {
	ID      primitive.ObjectID `bson:"_id,omitempty"`
	Images  []string           `bson:"images"`
	Text    string             `bson:"text"`
	Choices []string           `bson:"choices"`
	Answer  []int              `bson:"answer"`
	Points  int                `bson:"points"`
}

type QuizResult struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	QuizID      primitive.ObjectID `bson:"quiz_id"`
	UserID      primitive.ObjectID `bson:"user_id"`
	Answers     []int              `bson:"answers"`
	Score       int                `bson:"score"`
	SubmittedAt time.Time          `bson:"submitted_at"`
}
