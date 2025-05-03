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

type User struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Email    string             `bson:"email" json:"email"`
	Password string             `bson:"password" json:"-"`
	Role     Role               `bson:"role"   json:"role"`

	// Optional fields
	Classes     []primitive.ObjectID `bson:"classes,omitempty" json:"classes,omitempty"`
	QuizResults []QuizResultMeta     `bson:"quiz_results,omitempty" json:"quiz_results,omitempty"`
}

type QuizResultMeta struct {
	QuizID    primitive.ObjectID `bson:"quiz_id" json:"quiz_id"`
	Score     int                `bson:"score" json:"score"`
	Timestamp time.Time          `bson:"timestamp" json:"timestamp"`
}
