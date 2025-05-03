package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Class struct {
	ID        primitive.ObjectID   `bson:"_id,omitempty" json:"id,omitempty"`
	Name      string               `bson:"name" json:"name"`
	Code      string               `bson:"code" json:"code"`
	OwnerID   primitive.ObjectID   `bson:"owner_id" json:"owner_id"`
	Students  []primitive.ObjectID `bson:"students" json:"students"`
	CreatedAt time.Time            `bson:"created_at" json:"created_at"`
}
