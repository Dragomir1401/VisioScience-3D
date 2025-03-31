package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Role string

const (
	RoleStudent Role = "ELEV"
	RoleTeacher Role = "PROFESOR"
	RoleAdmin   Role = "ADMIN"
)

// Role maps to the user role in the system
var roleMap = map[string]Role{
	"student": RoleStudent,
	"teacher": RoleTeacher,
	"admin":   RoleAdmin,
}

type User struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Email    string             `bson:"email" json:"email"`
	Password string             `bson:"password" json:"-"` // Encrypted password
	Role     Role               `bson:"role"   json:"role"`
}
