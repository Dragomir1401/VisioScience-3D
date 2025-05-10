package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

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

type MoleculeRequest struct {
	Name        string `json:"name"`
	Formula     string `json:"formula"`
	Description string `json:"description"`
	MolFile     string `json:"molFile"`
}

type MolCounts struct {
	Atoms  int    `bson:"atoms"`
	Bonds  int    `bson:"bonds"`
	Lists  int    `bson:"lists"`
	Chiral bool   `bson:"chiral"`
	Stext  string `bson:"stext"`
}
