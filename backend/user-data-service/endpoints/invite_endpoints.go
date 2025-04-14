package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"user-data-service/models"
	db "user-data-service/mongo"

	"user-data-service/utils"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// POST /user/classes/{id}/invite
func SendInvite(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	if claims.Role != string(models.RoleTeacher) {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	classIDParam := mux.Vars(r)["id"]
	classID, err := primitive.ObjectIDFromHex(classIDParam)
	if err != nil {
		http.Error(w, "Invalid class ID", http.StatusBadRequest)
		return
	}

	var req struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	ownerID, err := primitive.ObjectIDFromHex(claims.UserID)
	if err != nil {
		http.Error(w, "Invalid owner ID", http.StatusBadRequest)
		return
	}

	invite := models.Invite{
		ID:        primitive.NewObjectID(),
		ClassID:   classID,
		SenderID:  ownerID,
		Receiver:  req.Email,
		Status:    models.Pending,
		CreatedAt: time.Now(),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err = db.InviteCollection.InsertOne(ctx, invite)
	if err != nil {
		http.Error(w, "DB error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Invitație trimisă"})
}

// GET /user/invites
func GetMyInvites(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := db.InviteCollection.Find(ctx, bson.M{
		"receiver": claims.Email,
		"status":   models.Pending,
	})
	if err != nil {
		http.Error(w, "DB error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	var invites []models.Invite
	if err := cursor.All(ctx, &invites); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(invites)
}

// POST /user/invites/{id}/respond
func RespondToInvite(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	inviteID, _ := primitive.ObjectIDFromHex(mux.Vars(r)["id"])

	var req struct {
		Accept bool `json:"accept"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var invite models.Invite
	err := db.InviteCollection.FindOne(ctx, bson.M{"_id": inviteID, "receiver": claims.Email}).Decode(&invite)
	if err != nil {
		http.Error(w, "Invite not found", http.StatusNotFound)
		return
	}

	// Update status
	newStatus := models.Declined
	if req.Accept {
		newStatus = models.Accepted
	}

	_, err = db.InviteCollection.UpdateByID(ctx, inviteID, bson.M{
		"$set": bson.M{"status": newStatus},
	})
	if err != nil {
		http.Error(w, "Update failed", http.StatusInternalServerError)
		return
	}

	studentID, err := primitive.ObjectIDFromHex(claims.UserID)
	if err != nil {
		http.Error(w, "Invalid student ID", http.StatusBadRequest)
		return
	}

	if req.Accept {
		_, err = db.ClassCollection.UpdateByID(ctx, invite.ClassID, bson.M{
			"$addToSet": bson.M{"students": studentID},
		})
		if err != nil {
			http.Error(w, "Failed to add student to class", http.StatusInternalServerError)
			return
		}
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Invite processed"})
}
