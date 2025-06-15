package controllers

import (
	"context"
	"log"
	"math"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"user-data-service/models"
)

type BadgeController struct {
	db *mongo.Database
}

func NewBadgeController(db *mongo.Database) *BadgeController {
	return &BadgeController{db: db}
}

// EnsureBadgesExist checks if all required badges exist and creates them if they don't
func (bc *BadgeController) EnsureBadgesExist(ctx context.Context) error {
	// Define default badges
	defaultBadges := []models.Badge{
		{
			ID:          primitive.NewObjectID(),
			Title:       "Primul Quiz",
			Description: "Completează primul quiz",
			Type:        "BronzeBadge",
			Icon:        "🎯",
			CreatedAt:   time.Now(),
		},
		{
			ID:          primitive.NewObjectID(),
			Title:       "Quiz Master",
			Description: "Completează 5 quiz-uri",
			Type:        "SilverBadge",
			Icon:        "🏆",
			CreatedAt:   time.Now(),
		},
		{
			ID:          primitive.NewObjectID(),
			Title:       "Expert",
			Description: "Completează 10 quiz-uri cu scor peste 80%",
			Type:        "GoldBadge",
			Icon:        "🌟",
			CreatedAt:   time.Now(),
		},
		{
			ID:          primitive.NewObjectID(),
			Title:       "Perfect Score",
			Description: "Obține un scor perfect la orice quiz",
			Type:        "PerfectBadge",
			Icon:        "💯",
			CreatedAt:   time.Now(),
		},
	}

	// Check each badge type
	for _, badge := range defaultBadges {
		// Check if badge type exists
		var existingBadge models.Badge
		err := bc.db.Collection("badges").FindOne(ctx, bson.M{"type": badge.Type}).Decode(&existingBadge)

		if err == mongo.ErrNoDocuments {
			// Badge type doesn't exist, create it
			log.Printf("Creating new badge: %s (%s)", badge.Title, badge.Type)
			_, err = bc.db.Collection("badges").InsertOne(ctx, badge)
			if err != nil {
				log.Printf("Error creating badge %s: %v", badge.Type, err)
				return err
			}
		} else if err != nil {
			log.Printf("Error checking badge %s: %v", badge.Type, err)
			return err
		} else {
			log.Printf("Badge %s already exists", badge.Type)
		}
	}

	return nil
}

// CheckAndUpdateBadges checks quiz results and updates badge progress
func (bc *BadgeController) CheckAndUpdateBadges(ctx context.Context, userID string, quizResult models.QuizResultMeta) ([]models.UserBadge, error) {
	log.Printf("=== Starting badge check for user %s ===", userID)
	log.Printf("📊 Quiz Result Details:")
	log.Printf("   - Quiz ID: %s", quizResult.QuizID.Hex())
	log.Printf("   - Quiz Title: %s", quizResult.QuizTitle)
	log.Printf("   - Score: %d/%d (%.2f%%)",
		quizResult.Score,
		quizResult.MaxScore,
		float64(quizResult.Score)/float64(quizResult.MaxScore)*100)
	log.Printf("   - Perfect Score: %v", quizResult.PerfectScore)
	log.Printf("   - Questions: %d correct, %d incorrect out of %d total",
		quizResult.QuestionsCorrect,
		quizResult.QuestionsIncorrect,
		quizResult.QuestionsTotal)
	log.Printf("   - Difficulty: %s", quizResult.DifficultyLevel)
	log.Printf("   - Performance: Accuracy=%.2f%%, Speed=%.2f, Consistency=%s",
		quizResult.PerformanceMetrics.Accuracy,
		quizResult.PerformanceMetrics.Speed,
		quizResult.PerformanceMetrics.Consistency)

	// First ensure all badges exist
	log.Printf("🔍 Ensuring all badges exist in the system...")
	if err := bc.EnsureBadgesExist(ctx); err != nil {
		log.Printf("❌ Error ensuring badges exist: %v", err)
		return nil, err
	}
	log.Printf("✅ All badges verified")

	// Get all badges
	log.Printf("📥 Fetching all badges from database...")
	badges, err := bc.GetAllBadges()
	if err != nil {
		log.Printf("❌ Error getting all badges: %v", err)
		return nil, err
	}
	log.Printf("✅ Found %d badges in system", len(badges))

	// Get user's quiz history
	log.Printf("👤 Fetching user %s quiz history...", userID)
	userOID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		log.Printf("❌ Error converting user ID to ObjectID: %v", err)
		return nil, err
	}

	var user models.User
	err = bc.db.Collection("users").FindOne(ctx, bson.M{"_id": userOID}).Decode(&user)
	if err != nil {
		log.Printf("❌ Error finding user %s: %v", userID, err)
		return nil, err
	}
	log.Printf("✅ Found user with %d quiz results", len(user.QuizResults))

	// Get user's current badge progress
	log.Printf("🏆 Fetching current badge progress for user %s...", userID)
	var userBadges []models.UserBadge
	cursor, err := bc.db.Collection("user_badges").Find(ctx, bson.M{"user_id": userID})
	if err != nil {
		log.Printf("❌ Error getting user badges: %v", err)
		return nil, err
	}
	defer cursor.Close(ctx)

	if err := cursor.All(ctx, &userBadges); err != nil {
		log.Printf("❌ Error decoding user badges: %v", err)
		return nil, err
	}

	if len(userBadges) == 0 {
		log.Printf("ℹ️ No existing badges found for user %s, will create new progress", userID)
		userBadges = make([]models.UserBadge, 0)
	} else {
		log.Printf("ℹ️ Found %d existing badges for user %s", len(userBadges), userID)
	}

	// Create a map of existing badges for easier lookup
	existingBadges := make(map[string]models.UserBadge)
	for _, badge := range userBadges {
		existingBadges[badge.BadgeID.Hex()] = badge
		log.Printf("   - Existing badge %s: Progress=%.0f%%, Completed=%v",
			badge.BadgeID.Hex(), badge.Progress, badge.Completed)
	}

	// Calculate progress for each badge
	log.Printf("🔄 Starting progress calculation for each badge...")
	var updatedBadges []models.UserBadge
	for _, badge := range badges {
		log.Printf("\n📌 Processing badge: %s (%s)", badge.Title, badge.Type)
		log.Printf("   Description: %s", badge.Description)

		var progress float64
		var currentValue float64

		// Calculate progress based on badge type
		switch badge.Type {
		case "BronzeBadge":
			// Bronze: Complete 1 quiz
			progress = math.Min(float64(len(user.QuizResults))*100, 100)
			currentValue = float64(len(user.QuizResults))
			log.Printf("   🥉 Bronze badge calculation:")
			log.Printf("      - Total quizzes completed: %d", len(user.QuizResults))
			log.Printf("      - Progress: %.0f%%", progress)
			log.Printf("      - Current value: %.0f", currentValue)

		case "SilverBadge":
			// Silver: Complete 5 quizzes
			progress = math.Min(float64(len(user.QuizResults))/5*100, 100)
			currentValue = float64(len(user.QuizResults))
			log.Printf("   🥈 Silver badge calculation:")
			log.Printf("      - Total quizzes completed: %d/5", len(user.QuizResults))
			log.Printf("      - Progress: %.0f%%", progress)
			log.Printf("      - Current value: %.0f", currentValue)

		case "GoldBadge":
			// Gold: Complete 10 quizzes with score > 80%
			highScoreQuizzes := 0
			for _, qr := range user.QuizResults {
				if qr.MaxScore > 0 && float64(qr.Score)/float64(qr.MaxScore) > 0.8 {
					highScoreQuizzes++
				}
			}
			progress = math.Min(float64(highScoreQuizzes)/10*100, 100)
			currentValue = float64(highScoreQuizzes)
			log.Printf("   🥇 Gold badge calculation:")
			log.Printf("      - High score quizzes (>80%%): %d/10", highScoreQuizzes)
			log.Printf("      - Progress: %.0f%%", progress)
			log.Printf("      - Current value: %.0f", currentValue)

		case "PerfectBadge":
			// Perfect: Get 100% on any quiz
			hasPerfect := false
			for _, result := range user.QuizResults {
				if result.PerfectScore {
					hasPerfect = true
					break
				}
			}
			if hasPerfect {
				progress = 100
				currentValue = 1
				log.Printf("   💯 Perfect badge calculation:")
				log.Printf("      - Found perfect score: true")
				log.Printf("      - Progress: 100%%")
				log.Printf("      - Current value: 1")
			} else {
				progress = 0
				currentValue = 0
				log.Printf("   💯 Perfect badge calculation:")
				log.Printf("      - Found perfect score: false")
				log.Printf("      - Progress: 0%%")
				log.Printf("      - Current value: 0")
			}
		}

		// Check if badge already exists for user
		existingBadge, exists := existingBadges[badge.ID.Hex()]
		if !exists {
			// Create new badge progress
			log.Printf("   ➕ Creating new badge progress for badge %s", badge.ID.Hex())
			userBadge := models.UserBadge{
				UserID:       userID,
				BadgeID:      badge.ID,
				Progress:     progress,
				CurrentValue: currentValue,
				Completed:    progress >= 100,
				UpdatedAt:    time.Now(),
			}

			_, err := bc.db.Collection("user_badges").InsertOne(ctx, userBadge)
			if err != nil {
				log.Printf("   ❌ Error inserting new badge progress: %v", err)
				continue
			}
			log.Printf("   ✅ Created new badge progress: Progress=%.0f%%, Completed=%v",
				progress, progress >= 100)
			updatedBadges = append(updatedBadges, userBadge)
		} else if existingBadge.Progress != progress {
			// Update existing badge progress
			log.Printf("   🔄 Updating existing badge progress for badge %s", badge.ID.Hex())
			log.Printf("      - Old progress: %.0f%%", existingBadge.Progress)
			log.Printf("      - New progress: %.0f%%", progress)
			log.Printf("      - Old completed: %v", existingBadge.Completed)
			log.Printf("      - New completed: %v", progress >= 100)

			update := bson.M{
				"$set": bson.M{
					"progress":      progress,
					"current_value": currentValue,
					"completed":     progress >= 100,
					"updated_at":    time.Now(),
				},
			}

			_, err := bc.db.Collection("user_badges").UpdateOne(
				ctx,
				bson.M{"user_id": userID, "badge_id": badge.ID},
				update,
			)
			if err != nil {
				log.Printf("   ❌ Error updating badge progress: %v", err)
				continue
			}

			existingBadge.Progress = progress
			existingBadge.CurrentValue = currentValue
			existingBadge.Completed = progress >= 100
			existingBadge.UpdatedAt = time.Now()
			updatedBadges = append(updatedBadges, existingBadge)
			log.Printf("   ✅ Successfully updated badge progress")
		} else {
			log.Printf("   ℹ️ No change in progress for badge %s: %.0f%%",
				badge.ID.Hex(), progress)
		}
	}

	log.Printf("\n=== Completed badge check for user %s ===", userID)
	log.Printf("📊 Summary of updates:")
	log.Printf("   - Total badges processed: %d", len(badges))
	log.Printf("   - Badges updated: %d", len(updatedBadges))
	for _, badge := range updatedBadges {
		log.Printf("   - Badge %s: Progress=%.0f%%, Completed=%v",
			badge.BadgeID.Hex(), badge.Progress, badge.Completed)
	}

	return updatedBadges, nil
}

func (bc *BadgeController) GetAllBadges() ([]models.Badge, error) {
	cursor, err := bc.db.Collection("badges").Find(context.Background(), bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var badges []models.Badge
	if err = cursor.All(context.Background(), &badges); err != nil {
		return nil, err
	}

	return badges, nil
}
