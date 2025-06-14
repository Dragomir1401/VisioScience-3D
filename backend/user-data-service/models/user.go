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

type PerformanceMetrics struct {
	Accuracy    float64 `bson:"accuracy" json:"accuracy"`
	Speed       float64 `bson:"speed" json:"speed"`
	Consistency string  `bson:"consistency" json:"consistency"`
}

type QuizResultMeta struct {
	QuizID                       primitive.ObjectID   `bson:"quiz_id" json:"quiz_id"`
	ClassID                      primitive.ObjectID   `bson:"class_id" json:"class_id"`
	Score                        int                  `bson:"score" json:"score"`
	MaxScore                     int                  `bson:"max_score" json:"max_score"`
	Points                       int64                `bson:"points" json:"points"`
	Timestamp                    time.Time            `bson:"timestamp" json:"timestamp"`
	TimeTaken                    int                  `bson:"time_taken" json:"time_taken"`
	PerfectScore                 bool                 `bson:"perfect_score" json:"perfect_score"`
	QuestionsTotal               int                  `bson:"questions_total" json:"questions_total"`
	QuestionsCorrect             int                  `bson:"questions_correct" json:"questions_correct"`
	QuestionsIncorrect           int                  `bson:"questions_incorrect" json:"questions_incorrect"`
	DifficultyLevel              string               `bson:"difficulty_level" json:"difficulty_level"`
	CompletionTime               int                  `bson:"completion_time" json:"completion_time"`
	StreakBonus                  int                  `bson:"streak_bonus" json:"streak_bonus"`
	TimeBonus                    int                  `bson:"time_bonus" json:"time_bonus"`
	PerfectBonus                 int                  `bson:"perfect_bonus" json:"perfect_bonus"`
	QuizTitle                    string               `bson:"quiz_title" json:"quiz_title"`
	QuizType                     string               `bson:"quiz_type" json:"quiz_type"`
	AttemptNumber                int                  `bson:"attempt_number" json:"attempt_number"`
	CompletionDate               string               `bson:"completion_date" json:"completion_date"`
	IncorrectlyAnsweredQuestions []primitive.ObjectID `bson:"incorrectly_answered_questions" json:"incorrectly_answered_questions"`
	PerformanceMetrics           PerformanceMetrics   `bson:"performance_metrics" json:"performance_metrics"`
}

type QuizPerformanceTrendEntry struct {
	Period          string  `json:"period"`
	Average         float64 `json:"average"`
	TopPerformer    float64 `json:"topPerformer"`
	LowestPerformer float64 `json:"lowestPerformer"`
}

type MostImprovedStudent struct {
	ID           primitive.ObjectID `json:"id"`
	Name         string             `json:"name"`
	Email        string             `json:"email"`
	InitialScore float64            `json:"initialScore"`
	CurrentScore float64            `json:"currentScore"`
	Improvement  float64            `json:"improvement"`
}
