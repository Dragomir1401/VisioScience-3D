package models

import (
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
