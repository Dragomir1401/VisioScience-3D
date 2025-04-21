package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Class struct {
	ID        primitive.ObjectID   `bson:"_id,omitempty"`
	Name      string               `bson:"name"`
	Code      string               `bson:"code"`
	OwnerID   primitive.ObjectID   `bson:"owner_id"`
	Students  []primitive.ObjectID `bson:"students"`
	CreatedAt time.Time            `bson:"created_at"`
}
