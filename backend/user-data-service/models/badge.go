package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type BadgeType string

const (
	BronzeBadge  BadgeType = "bronze"
	SilverBadge  BadgeType = "silver"
	GoldBadge    BadgeType = "gold"
	PerfectBadge BadgeType = "perfect"
)

type Badge struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Title       string             `bson:"title" json:"title"`
	Description string             `bson:"description" json:"description"`
	Type        BadgeType          `bson:"type" json:"type"`
	Color       string             `bson:"color" json:"color"`
	Icon        string             `bson:"icon" json:"icon"`
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type UserBadge struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID       string             `bson:"user_id" json:"user_id"`
	BadgeID      primitive.ObjectID `bson:"badge_id" json:"badge_id"`
	Progress     float64            `bson:"progress" json:"progress"`
	CurrentValue float64            `bson:"current_value" json:"current_value"`
	Completed    bool               `bson:"completed" json:"completed"`
	EarnedAt     time.Time          `bson:"earned_at,omitempty" json:"earned_at,omitempty"`
	UpdatedAt    time.Time          `bson:"updated_at" json:"updated_at"`
}

type BadgeWithProgress struct {
	Badge    Badge      `json:"badge"`
	Earned   bool       `json:"earned"`
	Progress float64    `json:"progress"`
	EarnedAt *time.Time `json:"earnedAt,omitempty"`
}
