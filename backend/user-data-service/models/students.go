package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type StudentResult struct {
	ID          primitive.ObjectID `json:"id"`
	Email       string             `json:"email"`
	Score       *int               `json:"score"`
	SubmittedAt *time.Time         `json:"submitted_at,omitempty"`
}
