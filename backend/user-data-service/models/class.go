package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Class struct {
	ID        primitive.ObjectID   `bson:"_id,omitempty"`
	Name      string               `bson:"name"`
	Code      string               `bson:"code"`     // Generat unic, folosit la înscriere
	OwnerID   primitive.ObjectID   `bson:"owner_id"` // Profesor
	Students  []primitive.ObjectID `bson:"students"` // Elevi înscriși
	CreatedAt time.Time            `bson:"created_at"`
}
