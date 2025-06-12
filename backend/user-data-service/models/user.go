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

	// Points and achievements
	TotalPoints   int64         `bson:"total_points" json:"total_points"`
	PointsHistory []PointsEntry `bson:"points_history,omitempty" json:"points_history,omitempty"`
	Badges        []Badge       `bson:"badges,omitempty" json:"badges,omitempty"`
	ClassRanking  int           `bson:"class_ranking,omitempty" json:"class_ranking,omitempty"`
	GlobalRanking int           `bson:"global_ranking,omitempty" json:"global_ranking,omitempty"`

	// Optional fields
	Classes     []primitive.ObjectID `bson:"classes,omitempty" json:"classes,omitempty"`
	QuizResults []QuizResultMeta     `bson:"quiz_results,omitempty" json:"quiz_results,omitempty"`
}

type PointsEntry struct {
	Points      int64     `bson:"points" json:"points"`
	Source      string    `bson:"source" json:"source"`       // e.g., "quiz", "achievement", "bonus"
	SourceID    string    `bson:"source_id" json:"source_id"` // ID of the quiz or achievement
	Description string    `bson:"description" json:"description"`
	Timestamp   time.Time `bson:"timestamp" json:"timestamp"`
}

type Badge struct {
	ID          string    `bson:"id" json:"id"`
	Name        string    `bson:"name" json:"name"`
	Description string    `bson:"description" json:"description"`
	Icon        string    `bson:"icon" json:"icon"`
	Level       int       `bson:"level" json:"level"`
	EarnedAt    time.Time `bson:"earned_at" json:"earned_at"`
}

type QuizResultMeta struct {
	QuizID    primitive.ObjectID `bson:"quiz_id" json:"quiz_id"`
	Score     int                `bson:"score" json:"score"`
	Points    int64              `bson:"points" json:"points"` // Points earned from this quiz
	Timestamp time.Time          `bson:"timestamp" json:"timestamp"`
}
