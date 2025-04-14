package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"user-data-service/models"
	db "user-data-service/mongo"

	"user-data-service/utils"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func CreateClass(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	if claims.Role != string(models.RoleTeacher) {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	var req struct {
		Name string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	code := utils.GenerateClassCode()

	ownerID, err := primitive.ObjectIDFromHex(claims.UserID)
	if err != nil {
		http.Error(w, "Invalid owner ID", http.StatusBadRequest)
		return
	}

	class := models.Class{
		ID:        primitive.NewObjectID(),
		Name:      req.Name,
		Code:      code,
		OwnerID:   ownerID,
		Students:  []primitive.ObjectID{},
		CreatedAt: time.Now(),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err = db.ClassCollection.InsertOne(ctx, class)
	if err != nil {
		http.Error(w, "Insert error", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(class)
}

func ListMyClasses(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	if claims.Role != string(models.RoleTeacher) {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	ownerID, err := primitive.ObjectIDFromHex(claims.UserID)
	if err != nil {
		http.Error(w, "Invalid owner ID", http.StatusBadRequest)
		return
	}

	cursor, err := db.ClassCollection.Find(ctx, bson.M{"owner_id": ownerID})
	if err != nil {
		http.Error(w, "Find error", http.StatusInternalServerError)
		return
	}

	var classes []models.Class
	if err := cursor.All(ctx, &classes); err != nil {
		http.Error(w, "Cursor error", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(classes)
}

func JoinClass(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	if claims.Role != string(models.RoleStudent) {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	var req struct {
		Code string `json:"code"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var class models.Class
	err := db.ClassCollection.FindOne(ctx, bson.M{"code": req.Code}).Decode(&class)
	if err != nil {
		http.Error(w, "Class not found", http.StatusNotFound)
		return
	}

	studentID, err := primitive.ObjectIDFromHex(claims.UserID)
	if err != nil {
		http.Error(w, "Invalid student ID", http.StatusBadRequest)
		return
	}
	update := bson.M{"$addToSet": bson.M{"students": studentID}}

	_, err = db.ClassCollection.UpdateByID(ctx, class.ID, update)
	if err != nil {
		http.Error(w, "Join failed", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Joined class"})
}

func AddStudentToClass(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	if claims.Role != string(models.RoleTeacher) {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	var req struct {
		ClassID   string `json:"class_id"`
		StudentID string `json:"student_id"` // alternativ: email
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	classOID, err := primitive.ObjectIDFromHex(req.ClassID)
	if err != nil {
		http.Error(w, "Invalid class ID", http.StatusBadRequest)
		return
	}
	studentOID, err := primitive.ObjectIDFromHex(req.StudentID)
	if err != nil {
		http.Error(w, "Invalid student ID", http.StatusBadRequest)
		return
	}

	// verifică dacă profesorul chiar deține clasa
	var class models.Class
	if err := db.ClassCollection.FindOne(ctx, bson.M{
		"_id":      classOID,
		"owner_id": claims.UserID,
	}).Decode(&class); err != nil {
		http.Error(w, "Class not found or not owned", http.StatusForbidden)
		return
	}

	// adaugă studentul
	_, err = db.ClassCollection.UpdateByID(ctx, classOID, bson.M{
		"$addToSet": bson.M{"students": studentOID},
	})
	if err != nil {
		http.Error(w, "Failed to add student", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Student adăugat cu succes în clasă.",
	})
}
