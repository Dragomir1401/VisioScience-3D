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
	ID            primitive.ObjectID   `bson:"_id,omitempty" json:"id,omitempty"`
	Email         string               `bson:"email" json:"email"`
	Password      string               `bson:"password" json:"-"`
	Role          Role                 `bson:"role" json:"role"`
	Classes       []primitive.ObjectID `bson:"classes" json:"classes"`
	QuizResults   []QuizResultMeta     `bson:"quiz_results" json:"quiz_results"`
	TotalPoints   int64                `bson:"total_points" json:"total_points"`
	PointsHistory []PointsEntry        `bson:"points_history" json:"points_history"`
	Badges        []Badge              `bson:"badges" json:"badges"`
	GlobalRanking int                  `bson:"global_ranking" json:"global_ranking"`
	ClassRanking  int                  `bson:"class_ranking" json:"class_ranking"`
	CreatedAt     time.Time            `bson:"created_at" json:"created_at"`
	LastLogin     time.Time            `bson:"last_login" json:"last_login"`
}

type PointsEntry struct {
	Points      int64     `bson:"points" json:"points"`
	Source      string    `bson:"source" json:"source"`       // "quiz", "achievement", etc.
	SourceID    string    `bson:"source_id" json:"source_id"` // ID of quiz or achievement
	Description string    `bson:"description" json:"description"`
	Timestamp   time.Time `bson:"timestamp" json:"timestamp"`
}

type Badge struct {
	ID          primitive.ObjectID `bson:"_id" json:"id"`
	Name        string             `bson:"name" json:"name"`
	Description string             `bson:"description" json:"description"`
	Icon        string             `bson:"icon" json:"icon"`
	EarnedAt    time.Time          `bson:"earned_at" json:"earned_at"`
}

type QuizResultMeta struct {
	QuizID    primitive.ObjectID `bson:"quiz_id" json:"quiz_id"`
	Score     int                `bson:"score" json:"score"`
	Points    int64              `bson:"points" json:"points"`
	Timestamp time.Time          `bson:"timestamp" json:"timestamp"`
}
