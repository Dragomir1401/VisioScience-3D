package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type InviteStatus string

const (
	Pending  InviteStatus = "PENDING"
	Accepted InviteStatus = "ACCEPTED"
	Declined InviteStatus = "DECLINED"
)

type Invite struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	ClassID   primitive.ObjectID `bson:"class_id" json:"class_id"`
	SenderID  primitive.ObjectID `bson:"sender_id" json:"sender_id"`
	Receiver  string             `bson:"receiver" json:"receiver"`
	Status    InviteStatus       `bson:"status" json:"status"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
}
