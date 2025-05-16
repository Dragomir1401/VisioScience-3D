package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"user-data-service/metrics"
	"user-data-service/models"
	db "user-data-service/mongo"
	"user-data-service/utils"

	"github.com/prometheus/client_golang/prometheus"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var (
	inviteOperations = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "invite_operations_total",
			Help: "Total number of invite operations",
		},
		[]string{"operation", "status"},
	)

	activeInvites = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "active_invites",
			Help: "Number of active invites",
		},
	)

	inviteErrors = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "invite_errors_total",
			Help: "Total number of invite operation errors",
		},
		[]string{"operation", "error_type"},
	)
)

func init() {
	prometheus.MustRegister(inviteOperations)
	prometheus.MustRegister(activeInvites)
	prometheus.MustRegister(inviteErrors)
}

// POST /user/classes/{id}/invite
func SendInvite(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	if claims.Role != string(models.RoleTeacher) {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", "/user/classes/{id}/invite", "403").Inc()
		inviteErrors.WithLabelValues("create", "forbidden").Inc()
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	classIDParam := mux.Vars(r)["id"]
	classID, err := primitive.ObjectIDFromHex(classIDParam)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", "/user/classes/{id}/invite", "400").Inc()
		inviteErrors.WithLabelValues("create", "invalid_id").Inc()
		http.Error(w, "Invalid class ID", http.StatusBadRequest)
		return
	}

	var req struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", "/user/classes/{id}/invite", "400").Inc()
		inviteErrors.WithLabelValues("create", "invalid_body").Inc()
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	ownerID, err := primitive.ObjectIDFromHex(claims.UserID)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", "/user/classes/{id}/invite", "400").Inc()
		inviteErrors.WithLabelValues("create", "invalid_owner_id").Inc()
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
		metrics.HTTPRequestsTotal.WithLabelValues("POST", "/user/classes/{id}/invite", "500").Inc()
		inviteErrors.WithLabelValues("create", "db_error").Inc()
		http.Error(w, "DB error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	metrics.HTTPRequestsTotal.WithLabelValues("POST", "/user/classes/{id}/invite", "201").Inc()
	metrics.ActiveInvites.Inc()
	inviteOperations.WithLabelValues("create", "success").Inc()
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
		metrics.HTTPRequestsTotal.WithLabelValues("GET", "/user/invites", "500").Inc()
		inviteErrors.WithLabelValues("list", "db_error").Inc()
		http.Error(w, "DB error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	var invites []models.Invite
	if err := cursor.All(ctx, &invites); err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", "/user/invites", "500").Inc()
		inviteErrors.WithLabelValues("list", "cursor_error").Inc()
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	metrics.HTTPRequestsTotal.WithLabelValues("GET", "/user/invites", "200").Inc()
	inviteOperations.WithLabelValues("list", "success").Inc()
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
	if err := db.InviteCollection.FindOne(
		ctx,
		bson.M{"_id": inviteID, "receiver": claims.Email},
	).Decode(&invite); err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", "/user/invites/{id}/respond", "404").Inc()
		inviteErrors.WithLabelValues("accept", "not_found").Inc()
		http.Error(w, "Invite not found", http.StatusNotFound)
		return
	}

	newStatus := models.Declined
	if req.Accept {
		newStatus = models.Accepted
	}
	if _, err := db.InviteCollection.UpdateByID(
		ctx, inviteID,
		bson.M{"$set": bson.M{"status": newStatus}},
	); err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", "/user/invites/{id}/respond", "500").Inc()
		inviteErrors.WithLabelValues("accept", "update_error").Inc()
		http.Error(w, "Update failed", http.StatusInternalServerError)
		return
	}

	if req.Accept {
		studentID, _ := primitive.ObjectIDFromHex(claims.UserID)

		if _, err := db.ClassCollection.UpdateByID(
			ctx, invite.ClassID,
			bson.M{"$addToSet": bson.M{"students": studentID}},
		); err != nil {
			metrics.HTTPRequestsTotal.WithLabelValues("POST", "/user/invites/{id}/respond", "500").Inc()
			inviteErrors.WithLabelValues("accept", "class_update_error").Inc()
			http.Error(w, "Failed to add student to class", http.StatusInternalServerError)
			return
		}

		if _, err := db.UserCollection.UpdateByID(
			ctx, studentID,
			bson.M{"$addToSet": bson.M{"classes": invite.ClassID}},
		); err != nil {
			metrics.HTTPRequestsTotal.WithLabelValues("POST", "/user/invites/{id}/respond", "500").Inc()
			inviteErrors.WithLabelValues("accept", "user_update_error").Inc()
			http.Error(w, "Failed to update user", http.StatusInternalServerError)
			return
		}
	}

	metrics.HTTPRequestsTotal.WithLabelValues("POST", "/user/invites/{id}/respond", "200").Inc()
	inviteOperations.WithLabelValues("accept", "success").Inc()
	json.NewEncoder(w).Encode(map[string]string{"message": "Invite processed"})
}
