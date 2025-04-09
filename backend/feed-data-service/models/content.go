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

type MolParsedData struct {
	Atoms []Atom `bson:"atoms,omitempty" json:"atoms,omitempty"`
	Bonds []Bond `bson:"bonds,omitempty" json:"bonds,omitempty"`
}

type Atom struct {
	X    float64 `bson:"x" json:"x"`
	Y    float64 `bson:"y" json:"y"`
	Z    float64 `bson:"z" json:"z"`
	Type string  `bson:"type" json:"type"`
}

type Bond struct {
	Atom1 int `bson:"atom1" json:"atom1"`
	Atom2 int `bson:"atom2" json:"atom2"`
	// tip bond (simplu, dublu, etc.)
	BondType int `bson:"bondType" json:"bondType"`
}

type Molecule struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name        string             `bson:"name" json:"name"`
	Formula     string             `bson:"formula" json:"formula"`
	MolFile     string             `bson:"molFile" json:"molFile"`
	Description string             `bson:"description" json:"description"`
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
	Source      string             `bson:"source" json:"source"`

	// Noul câmp parse
	ParsedData MolParsedData `bson:"parsedData,omitempty" json:"parsedData,omitempty"`
}
