# User Data Service - Badge System

## Overview
The badge system provides gamification elements to encourage student engagement and achievement in quiz completion. Students can earn various badges based on their performance and consistency.

## Badge Types

### Basic Badges
1. **BronzeBadge** - "Primul Quiz"
   - Description: Completează primul quiz
   - Requirement: Complete 1 quiz
   - Icon: 🎯

2. **SilverBadge** - "Quiz Master"
   - Description: Completează 5 quiz-uri
   - Requirement: Complete 5 quizzes
   - Icon: 🏆

3. **GoldBadge** - "Expert"
   - Description: Completează 10 quiz-uri cu scor peste 80%
   - Requirement: Complete 10 quizzes with >80% score
   - Icon: 🌟

4. **PerfectBadge** - "Perfect Score"
   - Description: Obține un scor perfect la orice quiz
   - Requirement: Get a perfect score on any quiz
   - Icon: 💯

### Challenging Badges (New)
5. **DiamondBadge** - "Maraton Quiz"
   - Description: Completează 25 quiz-uri în total
   - Requirement: Complete 25 quizzes total
   - Icon: 💎
   - Difficulty: High

6. **SpeedBadge** - "Viteza Fulgerului"
   - Description: Completează 5 quiz-uri în mai puțin de 2 minute fiecare
   - Requirement: Complete 5 quizzes in under 2 minutes each
   - Icon: ⚡
   - Difficulty: Very High

7. **StreakBadge** - "Consistența de Aur"
   - Description: Obține scor perfect la 3 quiz-uri consecutive
   - Requirement: Get perfect scores on 3 consecutive quizzes
   - Icon: 🔥
   - Difficulty: Very High

8. **MasterBadge** - "Maestrul Dificultății"
   - Description: Completează 15 quiz-uri cu dificultate ridicată (>90% scor)
   - Requirement: Complete 15 quizzes with >90% score
   - Icon: 👑
   - Difficulty: Extreme

9. **LegendBadge** - "Legenda Quiz-urilor"
   - Description: Obține 50 de scoruri perfecte în total
   - Requirement: Get 50 perfect scores total
   - Icon: 🏅
   - Difficulty: Legendary

## Implementation Details

### Backend
- **Controller**: `badge_controller.go` handles badge creation and progress tracking
- **Models**: Badge and UserBadge models define the data structure
- **Endpoints**: RESTful API endpoints for badge operations
- **Progress Calculation**: Automatic progress updates based on quiz results

### Frontend
- **Components**: 
  - `BadgeDisplay.tsx` - 3D badge visualization
  - `BalloonMascot.tsx` - Interactive 3D scene with floating badges
  - `BadgeNotification.tsx` - Notification component for earned badges
- **Pages**: `Achievements.jsx` - Main achievements page
- **Styling**: Tailwind CSS with custom color schemes for each badge type

### Database
- **Collections**: 
  - `badges` - Stores badge definitions
  - `user_badges` - Stores user progress for each badge
- **Indexes**: Optimized for user queries and badge lookups

## Progress Tracking
Badge progress is automatically calculated and updated when:
- A user completes a quiz
- Quiz results are submitted
- Performance metrics are updated

## Color Schemes
Each badge type has its own color scheme:
- Bronze: #CD7F32 (Brown)
- Silver: #C0C0C0 (Gray)
- Gold: #FFD700 (Yellow)
- Perfect: #FF69B4 (Pink)
- Diamond: #B9F2FF (Cyan)
- Speed: #FF6B35 (Orange)
- Streak: #FF4500 (Red)
- Master: #9370DB (Purple)
- Legend: #FFD700 (Gold)

## Deployment
To deploy the badge system:
1. Run the badge initialization script: `go run scripts/init_badges.go`
2. Ensure the user-data-service is running
3. Badges will be automatically created and progress tracked

## Future Enhancements
- Time-based challenges
- Subject-specific badges
- Team/class achievements
- Badge sharing and social features 