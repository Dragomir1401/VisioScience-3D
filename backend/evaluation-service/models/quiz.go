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
	Statistics  QuizStatistics     `bson:"statistics" json:"statistics"`

	// Points configuration
	MaxPoints    int64  `bson:"max_points" json:"max_points"`       // Maximum possible points for this quiz
	TimeBonus    bool   `bson:"time_bonus" json:"time_bonus"`       // Whether to give bonus points for quick completion
	PerfectBonus int64  `bson:"perfect_bonus" json:"perfect_bonus"` // Bonus points for perfect score
	StreakBonus  bool   `bson:"streak_bonus" json:"streak_bonus"`   // Whether to give bonus for consecutive perfect scores
	Difficulty   string `bson:"difficulty" json:"difficulty"`       // Easy, Medium, Hard
	Category     string `bson:"category" json:"category"`           // Quiz category (e.g., "Algorithms", "Data Structures")
}

type QuizInput struct {
	Title     string     `json:"title"`
	ClassID   string     `json:"class_id"`
	OwnerID   string     `json:"owner_id"`
	Questions []Question `json:"questions"`
	IsOpen    *bool      `json:"is_open,omitempty"`

	// Points configuration
	MaxPoints    int64  `json:"max_points"`
	TimeBonus    bool   `json:"time_bonus"`
	PerfectBonus int64  `json:"perfect_bonus"`
	StreakBonus  bool   `json:"streak_bonus"`
	Difficulty   string `json:"difficulty"`
	Category     string `json:"category"`
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
	ID                           primitive.ObjectID   `bson:"_id,omitempty" json:"id,omitempty"`
	QuizID                       primitive.ObjectID   `bson:"quiz_id" json:"quiz_id"`
	UserID                       primitive.ObjectID   `bson:"user_id" json:"user_id"`
	Answers                      []int                `bson:"answers" json:"answers"`
	Score                        int                  `bson:"score" json:"score"`
	Points                       int64                `bson:"points" json:"points"`               // Points earned
	TimeBonus                    int64                `bson:"time_bonus" json:"time_bonus"`       // Bonus points for quick completion
	PerfectBonus                 int64                `bson:"perfect_bonus" json:"perfect_bonus"` // Bonus for perfect score
	StreakBonus                  int64                `bson:"streak_bonus" json:"streak_bonus"`   // Bonus for consecutive perfect scores
	SubmittedAt                  time.Time            `bson:"submitted_at" json:"submitted_at"`
	TimeTaken                    int64                `bson:"time_taken" json:"time_taken"` // Time taken in seconds
	IncorrectlyAnsweredQuestions []primitive.ObjectID `bson:"incorrectly_answered_questions" json:"incorrectly_answered_questions"`
	PerformanceMetrics           struct {
		Accuracy    float64 `bson:"accuracy" json:"accuracy"`
		Speed       float64 `bson:"speed" json:"speed"`
		Consistency string  `bson:"consistency" json:"consistency"`
	} `bson:"performance_metrics" json:"performance_metrics"`
}

// QuizStatistics holds aggregated statistics for a quiz
type QuizStatistics struct {
	QuizID        primitive.ObjectID `bson:"quiz_id" json:"quiz_id"`
	TotalAttempts int                `bson:"total_attempts" json:"total_attempts"`
	AverageScore  float64            `bson:"average_score" json:"average_score"`
	AveragePoints float64            `bson:"average_points" json:"average_points"`
	PerfectScores int                `bson:"perfect_scores" json:"perfect_scores"`
	AverageTime   float64            `bson:"average_time" json:"average_time"`
	TopPerformers []TopPerformer     `bson:"top_performers" json:"top_performers"`
	QuestionStats []QuestionStats    `bson:"question_stats" json:"question_stats"`
}

type TopPerformer struct {
	UserID      primitive.ObjectID `bson:"user_id" json:"user_id"`
	Score       int                `bson:"score" json:"score"`
	Points      int64              `bson:"points" json:"points"`
	TimeTaken   int64              `bson:"time_taken" json:"time_taken"`
	SubmittedAt time.Time          `bson:"submitted_at" json:"submitted_at"`
}

type QuestionStats struct {
	QuestionID   primitive.ObjectID `bson:"question_id" json:"question_id"`
	CorrectCount int                `bson:"correct_count" json:"correct_count"`
	AttemptCount int                `bson:"attempt_count" json:"attempt_count"`
	AverageTime  float64            `bson:"average_time" json:"average_time"`
}

// UserQuizStats holds statistics for a user's performance on a specific quiz
type UserQuizStats struct {
	UserID             primitive.ObjectID `bson:"user_id" json:"user_id"`
	QuizID             primitive.ObjectID `bson:"quiz_id" json:"quiz_id"`
	TotalAttempts      int                `bson:"total_attempts" json:"total_attempts"`
	AverageScore       float64            `bson:"average_score" json:"average_score"`
	AverageTime        float64            `bson:"average_time" json:"average_time"`
	ConsecutivePerfect int                `bson:"consecutive_perfect" json:"consecutive_perfect"`
}
