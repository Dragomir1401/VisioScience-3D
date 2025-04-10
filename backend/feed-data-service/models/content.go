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
	Name        string    `json:"name"        bson:"name"`
	Description string    `json:"description" bson:"description"`
	CreatedAt   time.Time `json:"created_at"  bson:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"  bson:"updated_at"`
	DeletedAt   time.Time `json:"deleted_at"  bson:"deleted_at"`
}

type Molecule struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Metadata   Metadata           `bson:"metadata"    json:"metadata"`
	Formula    string             `bson:"formula"     json:"formula"`
	MolFile    string             `bson:"molFile"     json:"molFile"`
	ParsedData MolParsedData      `bson:"parsedData"  json:"parsedData"`
}

type MolHeader struct {
	Title     string `bson:"title,omitempty" json:"title,omitempty"`
	Program   string `bson:"program,omitempty" json:"program,omitempty"`
	TimeStamp string `bson:"timeStamp,omitempty" json:"timeStamp,omitempty"`
	Comment   string `bson:"comment,omitempty" json:"comment,omitempty"`
}

type MolCounts struct {
	Molecules int    `bson:"molecules" json:"molecules"`
	Bonds     int    `bson:"bonds"     json:"bonds"`
	Lists     int    `bson:"lists"     json:"lists"`
	Chiral    bool   `bson:"chiral"    json:"chiral"`
	Stext     string `bson:"stext,omitempty" json:"stext,omitempty"`
}

type Atom struct {
	X    float64 `bson:"x"    json:"x"`
	Y    float64 `bson:"y"    json:"y"`
	Z    float64 `bson:"z"    json:"z"`
	Type string  `bson:"type" json:"type"`
}

type Bond struct {
	Atom1    int `bson:"atom1"    json:"atom1"`
	Atom2    int `bson:"atom2"    json:"atom2"`
	BondType int `bson:"bondType" json:"bondType"`
}

type MolParsedData struct {
	Header MolHeader `bson:"header"    json:"header"`
	Counts MolCounts `bson:"counts"    json:"counts"`
	Atoms  []Atom    `bson:"atoms"     json:"atoms"`
	Bonds  []Bond    `bson:"bonds"     json:"bonds"`
}
