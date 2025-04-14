package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Quiz struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	Title     string             `bson:"title"`
	ClassID   primitive.ObjectID `bson:"class_id"`  // legat de o clasă
	OwnerID   primitive.ObjectID `bson:"owner_id"`  // profesorul care a creat
	Questions []Question         `bson:"questions"` // întrebări embedded
	CreatedAt time.Time          `bson:"created_at"`
}

type Question struct {
	Text    string   `bson:"text"`
	Choices []string `bson:"choices"` // multiple choice
	Answer  int      `bson:"answer"`  // index-ul opțiunii corecte
}

type QuizResult struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	QuizID      primitive.ObjectID `bson:"quiz_id"`
	UserID      primitive.ObjectID `bson:"user_id"`
	Answers     []int              `bson:"answers"` // indexuri alese
	Score       int                `bson:"score"`
	SubmittedAt time.Time          `bson:"submitted_at"`
}
