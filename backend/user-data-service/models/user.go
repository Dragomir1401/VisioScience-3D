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
	Source      string    `bson:"source" json:"source"`
	SourceID    string    `bson:"source_id" json:"source_id"`
	Description string    `bson:"description" json:"description"`
	Timestamp   time.Time `bson:"timestamp" json:"timestamp"`
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

type Claims struct {
	UserID    string `json:"user_id"`
	Email     string `json:"email"`
	Role      string `json:"role"`
	ExpiresAt int64  `json:"exp"`
}

type QuizResult struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID      string             `bson:"user_id" json:"user_id"`
	QuizID      primitive.ObjectID `bson:"quiz_id" json:"quiz_id"`
	ClassID     primitive.ObjectID `bson:"class_id" json:"class_id"`
	Score       float64            `bson:"score" json:"score"`
	MaxScore    float64            `bson:"max_score" json:"max_score"`
	SubmittedAt time.Time          `bson:"submitted_at" json:"submitted_at"`
	Answers     []Answer           `bson:"answers" json:"answers"`
}

type Answer struct {
	QuestionID primitive.ObjectID `bson:"question_id" json:"question_id"`
	Answer     string             `bson:"answer" json:"answer"`
	IsCorrect  bool               `bson:"is_correct" json:"is_correct"`
}

type ClassPerformance struct {
	ClassID       primitive.ObjectID `json:"class_id"`
	ClassName     string             `json:"class_name"`
	AverageScore  float64            `json:"average_score"`
	TotalQuizzes  int                `json:"total_quizzes"`
	TotalStudents int                `json:"total_students"`
}

type StudentPerformance struct {
	UserID       string  `json:"user_id"`
	FirstName    string  `json:"first_name"`
	LastName     string  `json:"last_name"`
	AverageScore float64 `json:"average_score"`
	TotalQuizzes int     `json:"total_quizzes"`
	Improvement  float64 `json:"improvement"`
}
