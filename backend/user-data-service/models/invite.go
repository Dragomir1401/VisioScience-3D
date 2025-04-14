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
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	ClassID   primitive.ObjectID `bson:"class_id"`
	SenderID  primitive.ObjectID `bson:"sender_id"` // profesor
	Receiver  string             `bson:"receiver"`  // email elev
	Status    InviteStatus       `bson:"status"`
	CreatedAt time.Time          `bson:"created_at"`
}
