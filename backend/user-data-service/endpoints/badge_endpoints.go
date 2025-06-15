package endpoints

import (
	"context"
	"net/http"
	"time"

	"../models"
	"../mongo"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type BadgeHandler struct {
	db *mongo.Database
}

func NewBadgeHandler(db *mongo.Database) *BadgeHandler {
	return &BadgeHandler{db: db}
}

// GetUserBadges returns all badges with progress for a specific user
func (h *BadgeHandler) GetUserBadges(c *gin.Context) {
	userID := c.Param("userId")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "userId is required"})
		return
	}

	// Get all badges
	badgesCursor, err := h.db.Collection("badges").Find(context.Background(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch badges"})
		return
	}
	defer badgesCursor.Close(context.Background())

	var badges []models.Badge
	if err := badgesCursor.All(context.Background(), &badges); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode badges"})
		return
	}

	// Get user's badge progress
	userBadgesCursor, err := h.db.Collection("user_badges").Find(
		context.Background(),
		bson.M{"userId": userID},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user badges"})
		return
	}
	defer userBadgesCursor.Close(context.Background())

	var userBadges []models.UserBadge
	if err := userBadgesCursor.All(context.Background(), &userBadges); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode user badges"})
		return
	}

	// Create a map of badge progress for quick lookup
	badgeProgress := make(map[primitive.ObjectID]models.UserBadge)
	for _, ub := range userBadges {
		badgeProgress[ub.BadgeID] = ub
	}

	// Combine badges with progress
	var result []models.BadgeWithProgress
	for _, badge := range badges {
		progress := models.BadgeWithProgress{
			Badge:    badge,
			Earned:   false,
			Progress: 0,
		}

		if ub, exists := badgeProgress[badge.ID]; exists {
			progress.Earned = ub.Completed
			progress.Progress = ub.Progress
			progress.EarnedAt = &ub.EarnedAt
		}

		result = append(result, progress)
	}

	c.JSON(http.StatusOK, result)
}

// UpdateBadgeProgress updates the progress of a badge for a user
func (h *BadgeHandler) UpdateBadgeProgress(c *gin.Context) {
	userID := c.Param("userId")
	badgeID := c.Param("badgeId")

	var update struct {
		Progress float64 `json:"progress"`
	}
	if err := c.ShouldBindJSON(&update); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Validate progress value
	if update.Progress < 0 || update.Progress > 100 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Progress must be between 0 and 100"})
		return
	}

	// Convert badgeID to ObjectID
	badgeObjID, err := primitive.ObjectIDFromHex(badgeID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid badge ID"})
		return
	}

	// Update or insert user badge progress
	opts := options.Update().SetUpsert(true)
	filter := bson.M{
		"userId":  userID,
		"badgeId": badgeObjID,
	}
	updateDoc := bson.M{
		"$set": bson.M{
			"progress":  update.Progress,
			"completed": update.Progress >= 100,
			"updatedAt": time.Now(),
		},
		"$setOnInsert": bson.M{
			"earnedAt": time.Now(),
		},
	}

	_, err = h.db.Collection("user_badges").UpdateOne(
		context.Background(),
		filter,
		updateDoc,
		opts,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update badge progress"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Badge progress updated successfully"})
}

// GetBadgeDetails returns detailed information about a specific badge
func (h *BadgeHandler) GetBadgeDetails(c *gin.Context) {
	badgeID := c.Param("badgeId")
	userID := c.Param("userId")

	// Convert badgeID to ObjectID
	badgeObjID, err := primitive.ObjectIDFromHex(badgeID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid badge ID"})
		return
	}

	// Get badge details
	var badge models.Badge
	err = h.db.Collection("badges").FindOne(
		context.Background(),
		bson.M{"_id": badgeObjID},
	).Decode(&badge)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Badge not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch badge details"})
		return
	}

	// Get user's progress for this badge
	var userBadge models.UserBadge
	err = h.db.Collection("user_badges").FindOne(
		context.Background(),
		bson.M{
			"userId":  userID,
			"badgeId": badgeObjID,
		},
	).Decode(&userBadge)

	result := models.BadgeWithProgress{
		Badge:    badge,
		Earned:   false,
		Progress: 0,
	}

	if err == nil {
		result.Earned = userBadge.Completed
		result.Progress = userBadge.Progress
		result.EarnedAt = &userBadge.EarnedAt
	}

	c.JSON(http.StatusOK, result)
}
