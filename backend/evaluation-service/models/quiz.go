package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Role string

const (
	RoleStudent Role = "ELEV"
	RoleTeacher Role = "PROFESOR"
	RoleAdmin   Role = "ADMIN"
)

type Quiz struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Title       string             `bson:"title" json:"title"`
	ClassID     primitive.ObjectID `bson:"class_id" json:"class_id"`
	OwnerID     primitive.ObjectID `bson:"owner_id" json:"owner_id"`
	Questions   []Question         `bson:"questions" json:"questions"`
	QuizResults []QuizResult       `bson:"quiz_results" json:"quiz_results"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	IsOpen      bool               `bson:"is_open" json:"is_open"`
}

type QuizInput struct {
	Title     string     `json:"title"`
	ClassID   string     `json:"class_id"`
	OwnerID   string     `json:"owner_id"`
	Questions []Question `json:"questions"`
	IsOpen    *bool      `json:"is_open,omitempty"`
}

type Question struct {
	ID      primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Images  []string           `bson:"images" json:"images"`
	Text    string             `bson:"text" json:"text"`
	Choices []string           `bson:"choices" json:"choices"`
	Answer  []int              `bson:"answer" json:"answer"`
	Points  int                `bson:"points" json:"points"`
}

type QuizResult struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	QuizID      primitive.ObjectID `bson:"quiz_id" json:"quiz_id"`
	UserID      primitive.ObjectID `bson:"user_id" json:"user_id"`
	Answers     []int              `bson:"answers" json:"answers"`
	Score       int                `bson:"score" json:"score"`
	SubmittedAt time.Time          `bson:"submitted_at" json:"submitted_at"`
}
