package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Feed struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Formula  Formula            `json:"formula"       bson:"formula"`
	Metadata Metadata           `json:"metadata"      bson:"metadata"`
}

type Formula struct {
	Shape string `json:"shape" bson:"shape"`
	Name  string `json:"name"  bson:"name"`
	Expr  string `json:"expr"  bson:"expr"`
}

type Metadata struct {
	Name      string `json:"name"        bson:"name"`
	CreatedAt string `json:"created_at"  bson:"created_at"`
}

type Molecule struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name        string             `bson:"name" json:"name"`
	Formula     string             `bson:"formula" json:"formula"`
	MolFile     string             `bson:"molFile" json:"molFile"`
	Description string             `bson:"description" json:"description"`
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
	Source      string             `bson:"source" json:"source"`
}
