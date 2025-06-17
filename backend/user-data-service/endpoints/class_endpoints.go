package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"sort"
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
	classOperations = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "class_operations_total",
			Help: "Total number of class operations",
		},
		[]string{"operation", "status"},
	)

	activeClasses = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "active_classes",
			Help: "Number of active classes",
		},
	)

	classStudents = prometheus.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "class_students",
			Help: "Number of students per class",
		},
		[]string{"class_id"},
	)

	classErrors = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "class_errors_total",
			Help: "Total number of class operation errors",
		},
		[]string{"operation", "error_type"},
	)
)

func init() {
	prometheus.MustRegister(classOperations)
	prometheus.MustRegister(activeClasses)
	prometheus.MustRegister(classStudents)
	prometheus.MustRegister(classErrors)
}

func CreateClass(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	if claims.Role != string(models.RoleTeacher) {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "403").Inc()
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	var req struct {
		Name string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	code := utils.GenerateClassCode()

	ownerID, err := primitive.ObjectIDFromHex(claims.UserID)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "400").Inc()
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
		metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Insert error", http.StatusInternalServerError)
		return
	}

	metrics.ActiveClasses.Inc()
	metrics.HTTPRequestsTotal.WithLabelValues("POST", utils.NormalizePath(r.URL.Path), "201").Inc()
	json.NewEncoder(w).Encode(class)
}

func ListMyClasses(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	if claims.Role != string(models.RoleTeacher) {
		classErrors.WithLabelValues("list", "forbidden").Inc()
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	ownerID, err := primitive.ObjectIDFromHex(claims.UserID)
	if err != nil {
		classErrors.WithLabelValues("list", "invalid_owner_id").Inc()
		http.Error(w, "Invalid owner ID", http.StatusBadRequest)
		return
	}

	cursor, err := db.ClassCollection.Find(ctx, bson.M{"owner_id": ownerID})
	if err != nil {
		classErrors.WithLabelValues("list", "db_error").Inc()
		http.Error(w, "Find error", http.StatusInternalServerError)
		return
	}

	var classes []models.Class
	if err := cursor.All(ctx, &classes); err != nil {
		classErrors.WithLabelValues("list", "cursor_error").Inc()
		http.Error(w, "Cursor error", http.StatusInternalServerError)
		return
	}

	classOperations.WithLabelValues("list", "success").Inc()

	json.NewEncoder(w).Encode(classes)
}

func JoinClass(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	if claims.Role != string(models.RoleStudent) {
		classErrors.WithLabelValues("join", "forbidden").Inc()
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	var req struct {
		Code string `json:"code"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		classErrors.WithLabelValues("join", "invalid_body").Inc()
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var class models.Class
	err := db.ClassCollection.FindOne(ctx, bson.M{"code": req.Code}).Decode(&class)
	if err != nil {
		classErrors.WithLabelValues("join", "class_not_found").Inc()
		http.Error(w, "Class not found", http.StatusNotFound)
		return
	}

	studentID, err := primitive.ObjectIDFromHex(claims.UserID)
	if err != nil {
		classErrors.WithLabelValues("join", "invalid_student_id").Inc()
		http.Error(w, "Invalid student ID", http.StatusBadRequest)
		return
	}
	update := bson.M{"$addToSet": bson.M{"students": studentID}}

	_, err = db.ClassCollection.UpdateByID(ctx, class.ID, update)
	if err != nil {
		classErrors.WithLabelValues("join", "update_error").Inc()
		http.Error(w, "Join failed", http.StatusInternalServerError)
		return
	}

	classOperations.WithLabelValues("join", "success").Inc()
	classStudents.WithLabelValues(class.ID.Hex()).Inc()

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Joined class"})
}

func AddStudentToClass(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	if claims.Role != string(models.RoleTeacher) {
		classErrors.WithLabelValues("add_student", "forbidden").Inc()
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	var req struct {
		ClassID   string `json:"class_id"`
		StudentID string `json:"student_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		classErrors.WithLabelValues("add_student", "invalid_body").Inc()
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	classOID, err := primitive.ObjectIDFromHex(req.ClassID)
	if err != nil {
		classErrors.WithLabelValues("add_student", "invalid_class_id").Inc()
		http.Error(w, "Invalid class ID", http.StatusBadRequest)
		return
	}
	studentOID, err := primitive.ObjectIDFromHex(req.StudentID)
	if err != nil {
		classErrors.WithLabelValues("add_student", "invalid_student_id").Inc()
		http.Error(w, "Invalid student ID", http.StatusBadRequest)
		return
	}

	var class models.Class
	if err := db.ClassCollection.FindOne(ctx, bson.M{
		"_id":      classOID,
		"owner_id": claims.UserID,
	}).Decode(&class); err != nil {
		classErrors.WithLabelValues("add_student", "class_not_found").Inc()
		http.Error(w, "Class not found or not owned", http.StatusForbidden)
		return
	}

	_, err = db.ClassCollection.UpdateByID(ctx, classOID, bson.M{
		"$addToSet": bson.M{"students": studentOID},
	})
	if err != nil {
		classErrors.WithLabelValues("add_student", "update_error").Inc()
		http.Error(w, "Failed to add student", http.StatusInternalServerError)
		return
	}

	classOperations.WithLabelValues("add_student", "success").Inc()
	classStudents.WithLabelValues(class.ID.Hex()).Inc()

	metrics.HTTPRequestsTotal.WithLabelValues("PUT", utils.NormalizePath(r.URL.Path), "200").Inc()
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Student added to class"})
}

func GetClassStudents(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	if claims.Role != string(models.RoleTeacher) {
		classErrors.WithLabelValues("get_students", "forbidden").Inc()
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	classIDHex := mux.Vars(r)["id"]
	classID, err := primitive.ObjectIDFromHex(classIDHex)
	if err != nil {
		classErrors.WithLabelValues("get_students", "invalid_class_id").Inc()
		http.Error(w, "Invalid class ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var class models.Class
	if err := db.ClassCollection.FindOne(ctx, bson.M{"_id": classID}).Decode(&class); err != nil {
		classErrors.WithLabelValues("get_students", "class_not_found").Inc()
		http.Error(w, "Class not found", http.StatusNotFound)
		return
	}

	cursor, err := db.UserCollection.Find(ctx, bson.M{"_id": bson.M{"$in": class.Students}})
	if err != nil {
		classErrors.WithLabelValues("get_students", "db_error").Inc()
		http.Error(w, "Error fetching students", http.StatusInternalServerError)
		return
	}

	var students []models.User
	if err := cursor.All(ctx, &students); err != nil {
		classErrors.WithLabelValues("get_students", "cursor_error").Inc()
		http.Error(w, "Cursor error", http.StatusInternalServerError)
		return
	}

	for i := range students {
		students[i].Password = ""
	}

	classOperations.WithLabelValues("get_students", "success").Inc()

	json.NewEncoder(w).Encode(students)
}

func RemoveStudentFromClass(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	if claims.Role != string(models.RoleTeacher) {
		classErrors.WithLabelValues("remove_student", "forbidden").Inc()
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	classID := mux.Vars(r)["id"]
	studentID := mux.Vars(r)["studentId"]

	classOID, err := primitive.ObjectIDFromHex(classID)
	if err != nil {
		classErrors.WithLabelValues("remove_student", "invalid_class_id").Inc()
		http.Error(w, "Invalid class ID", http.StatusBadRequest)
		return
	}

	studentOID, err := primitive.ObjectIDFromHex(studentID)
	if err != nil {
		classErrors.WithLabelValues("remove_student", "invalid_student_id").Inc()
		http.Error(w, "Invalid student ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	update := bson.M{"$pull": bson.M{"students": studentOID}}

	_, err = db.ClassCollection.UpdateByID(ctx, classOID, update)
	if err != nil {
		classErrors.WithLabelValues("remove_student", "update_error").Inc()
		http.Error(w, "Failed to remove student", http.StatusInternalServerError)
		return
	}

	classOperations.WithLabelValues("remove_student", "success").Inc()
	classStudents.WithLabelValues(classID).Dec()

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Student removed"})
}

type ClassPerformanceSummary struct {
	ClassID       primitive.ObjectID `json:"class_id"`
	ClassName     string             `json:"class_name"`
	AverageScore  float64            `json:"average_score"`
	TotalStudents int                `json:"total_students"`
	QuizzesTaken  int                `json:"quizzes_taken"`
	Improvement   string             `json:"improvement"`
}

func calculateImprovement(quizResults []models.QuizResultMeta) string {
	if len(quizResults) < 2 {
		return "N/A"
	}

	sort.Slice(quizResults, func(i, j int) bool {
		return quizResults[i].Timestamp.Before(quizResults[j].Timestamp)
	})

	midPoint := len(quizResults) / 2
	firstHalf := quizResults[:midPoint]
	secondHalf := quizResults[midPoint:]

	var firstHalfTotal, secondHalfTotal float64
	var firstHalfCount, secondHalfCount int

	for _, qr := range firstHalf {
		if qr.MaxScore > 0 {
			scorePercentage := float64(qr.Score) / float64(qr.MaxScore) * 100
			firstHalfTotal += scorePercentage
			firstHalfCount++
		}
	}

	for _, qr := range secondHalf {
		if qr.MaxScore > 0 {
			scorePercentage := float64(qr.Score) / float64(qr.MaxScore) * 100
			secondHalfTotal += scorePercentage
			secondHalfCount++
		}
	}

	if firstHalfCount == 0 || secondHalfCount == 0 {
		return "N/A"
	}

	firstHalfAvg := firstHalfTotal / float64(firstHalfCount)
	secondHalfAvg := secondHalfTotal / float64(secondHalfCount)

	improvement := ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100

	if improvement > 5 {
		return fmt.Sprintf("↑ %.1f%%", improvement)
	} else if improvement < -5 {
		return fmt.Sprintf("↓ %.1f%%", -improvement)
	} else {
		return "Stabil"
	}
}

// GET /user/classes/performance
func GetClassPerformance(w http.ResponseWriter, r *http.Request) {
	path := utils.NormalizePath(r.URL.Path)
	defer func() {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", path, "200").Inc()
	}()

	claims := r.Context().Value("claims").(*utils.CustomClaims)
	if claims.Role != string(models.RoleTeacher) && claims.Role != string(models.RoleAdmin) {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", path, "403").Inc()
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := db.ClassCollection.Find(ctx, bson.M{})
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", path, "500").Inc()
		http.Error(w, "Failed to fetch classes", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var classes []models.Class
	if err := cursor.All(ctx, &classes); err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", path, "500").Inc()
		http.Error(w, "Failed to decode classes", http.StatusInternalServerError)
		return
	}

	var performanceData []ClassPerformanceSummary

	for _, class := range classes {
		studentCursor, err := db.UserCollection.Find(ctx, bson.M{"_id": bson.M{"$in": class.Students}})
		if err != nil {
			log.Printf("Error fetching students for class %s: %v", class.Name, err)
			continue
		}
		var students []models.User
		if err := studentCursor.All(ctx, &students); err != nil {
			log.Printf("Error decoding students for class %s: %v", class.Name, err)
			studentCursor.Close(ctx)
			continue
		}
		studentCursor.Close(ctx)

		totalScore := 0
		totalMaxPossibleScore := 0
		totalQuizzesTaken := 0
		totalStudents := len(students)

		log.Printf("--- Class: %s (ID: %s) ---", class.Name, class.ID.Hex())
		log.Printf("Total students in class: %d", totalStudents)

		var allQuizResults []models.QuizResultMeta

		for _, student := range students {
			studentQuizzesTaken := 0
			studentCurrentScore := 0
			studentCurrentMaxScore := 0
			for _, qr := range student.QuizResults {
				if qr.MaxScore > 0 {
					studentQuizzesTaken++
					studentCurrentScore += qr.Score
					studentCurrentMaxScore += qr.MaxScore
					allQuizResults = append(allQuizResults, qr)
				} else {
					log.Printf("  Skipping quiz result %s for student %s due to MaxScore being 0.", qr.QuizID.Hex(), student.Email)
				}
			}
			totalScore += studentCurrentScore
			totalMaxPossibleScore += studentCurrentMaxScore

			log.Printf("  Student %s (ID: %s): Quizzes with valid MaxScore: %d, Total score for valid quizzes: %d, Total max score for valid quizzes: %d", student.Email, student.ID.Hex(), studentQuizzesTaken, studentCurrentScore, studentCurrentMaxScore)
		}

		log.Printf("Total actual score for class before average (from valid quizzes): %d", totalScore)
		log.Printf("Total max possible score for class before average (from valid quizzes): %d", totalMaxPossibleScore)
		log.Printf("Total quizzes with valid MaxScore for class before average: %d", totalQuizzesTaken)

		avgScore := 0.0
		if totalMaxPossibleScore > 0 {
			avgScore = float64(totalScore) / float64(totalMaxPossibleScore) * 100
		}

		log.Printf("Calculated average score for class %s: %.2f%%", class.Name, avgScore)

		improvement := calculateImprovement(allQuizResults)

		performanceData = append(performanceData, ClassPerformanceSummary{
			ClassID:       class.ID,
			ClassName:     class.Name,
			AverageScore:  avgScore,
			TotalStudents: totalStudents,
			QuizzesTaken:  totalQuizzesTaken,
			Improvement:   improvement,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(performanceData)
}

type QuizPerformance struct {
	QuizID        primitive.ObjectID `json:"quiz_id"`
	QuizTitle     string             `json:"quiz_title"`
	AverageScore  float64            `json:"average_score"`
	TotalAttempts int                `json:"total_attempts"`
}

// GET /user/classes/{classId}/quiz-performance
func GetClassQuizPerformance(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	if claims.Role != string(models.RoleTeacher) && claims.Role != string(models.RoleAdmin) {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "403").Inc()
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	classID := mux.Vars(r)["classId"]
	classOID, err := primitive.ObjectIDFromHex(classID)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "Invalid class ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var class models.Class
	if err := db.ClassCollection.FindOne(ctx, bson.M{"_id": classOID}).Decode(&class); err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "404").Inc()
		http.Error(w, "Class not found", http.StatusNotFound)
		return
	}

	cursor, err := db.UserCollection.Find(ctx, bson.M{"_id": bson.M{"$in": class.Students}})
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Failed to fetch students", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var students []models.User
	if err := cursor.All(ctx, &students); err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Failed to decode students", http.StatusInternalServerError)
		return
	}

	quizPerformance := make(map[primitive.ObjectID]*QuizPerformance)

	for _, student := range students {
		for _, qr := range student.QuizResults {
			if qr.MaxScore > 0 {
				perf, exists := quizPerformance[qr.QuizID]
				if !exists {
					perf = &QuizPerformance{
						QuizID:        qr.QuizID,
						QuizTitle:     qr.QuizTitle,
						AverageScore:  0,
						TotalAttempts: 0,
					}
					quizPerformance[qr.QuizID] = perf
				}

				scorePercentage := float64(qr.Score) / float64(qr.MaxScore) * 100
				perf.AverageScore = (perf.AverageScore*float64(perf.TotalAttempts) + scorePercentage) / float64(perf.TotalAttempts+1)
				perf.TotalAttempts++
			}
		}
	}

	var performanceData []QuizPerformance
	for _, perf := range quizPerformance {
		performanceData = append(performanceData, *perf)
	}

	sort.Slice(performanceData, func(i, j int) bool {
		return performanceData[i].QuizTitle < performanceData[j].QuizTitle
	})

	metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "200").Inc()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(performanceData)
}

// GET /user/classes/{classId}/quiz/{quizId}/results
func GetClassQuizResults(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	if claims.Role != string(models.RoleTeacher) {
		classErrors.WithLabelValues("get_quiz_results", "forbidden").Inc()
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	classIDHex := mux.Vars(r)["classId"]
	quizIDHex := mux.Vars(r)["quizId"]
	classID, err := primitive.ObjectIDFromHex(classIDHex)
	if err != nil {
		classErrors.WithLabelValues("get_quiz_results", "invalid_class_id").Inc()
		http.Error(w, "Invalid class ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var class models.Class
	if err := db.ClassCollection.FindOne(ctx, bson.M{"_id": classID}).Decode(&class); err != nil {
		classErrors.WithLabelValues("get_quiz_results", "class_not_found").Inc()
		http.Error(w, "Class not found", http.StatusNotFound)
		return
	}

	cursor, err := db.UserCollection.Find(ctx, bson.M{"_id": bson.M{"$in": class.Students}})
	if err != nil {
		classErrors.WithLabelValues("get_quiz_results", "db_error").Inc()
		http.Error(w, "Error fetching students", http.StatusInternalServerError)
		return
	}
	var users []models.User
	if err := cursor.All(ctx, &users); err != nil {
		classErrors.WithLabelValues("get_quiz_results", "cursor_error").Inc()
		http.Error(w, "Cursor error", http.StatusInternalServerError)
		return
	}
	for i := range users {
		users[i].Password = ""
	}

	evalURL := fmt.Sprintf("%s/evaluation/quiz/%s/results", utils.GetEnv("EVAL_SERVICE_URL", "http://localhost:8000"), quizIDHex)
	reqEval, _ := http.NewRequestWithContext(ctx, "GET", evalURL, nil)
	reqEval.Header.Set("Authorization", r.Header.Get("Authorization"))
	respEval, err := http.DefaultClient.Do(reqEval)
	if err != nil {
		classErrors.WithLabelValues("get_quiz_results", "eval_service_error").Inc()
		http.Error(w, "Error contacting evaluation service", http.StatusInternalServerError)
		return
	}
	defer respEval.Body.Close()

	if respEval.StatusCode != http.StatusOK {
		body, _ := ioutil.ReadAll(respEval.Body)
		classErrors.WithLabelValues("get_quiz_results", "eval_service_error").Inc()
		http.Error(w, string(body), respEval.StatusCode)
		return
	}

	var evalResults []struct {
		UserID      primitive.ObjectID `json:"user_id"`
		Score       int                `json:"score"`
		SubmittedAt time.Time          `json:"submitted_at"`
	}
	if err := json.NewDecoder(respEval.Body).Decode(&evalResults); err != nil {
		classErrors.WithLabelValues("get_quiz_results", "decode_error").Inc()
		http.Error(w, "Failed to decode results", http.StatusInternalServerError)
		return
	}

	best := make(map[string]models.StudentResult)
	for _, er := range evalResults {
		key := er.UserID.Hex()
		prev, ok := best[key]
		if !ok || (prev.SubmittedAt != nil && er.SubmittedAt.After(*prev.SubmittedAt)) {
			sc := er.Score
			t := er.SubmittedAt
			best[key] = models.StudentResult{
				ID:          er.UserID,
				Email:       "",
				Score:       &sc,
				SubmittedAt: &t,
			}
		}
	}

	out := make([]models.StudentResult, 0, len(users))
	for _, u := range users {
		key := u.ID.Hex()
		if r, ok := best[key]; ok {
			r.Email = u.Email
			out = append(out, r)
		} else {
			out = append(out, models.StudentResult{
				ID:    u.ID,
				Email: u.Email,
				Score: nil,
			})
		}
	}

	classOperations.WithLabelValues("get_quiz_results", "success").Inc()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(out)
}

// DELETE /user/classes/{id}
func DeleteClass(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	claims := r.Context().Value("claims").(*utils.CustomClaims)

	if claims.Role != string(models.RoleTeacher) {
		metrics.HTTPRequestsTotal.WithLabelValues("DELETE", "/user/classes/{id}", "403").Inc()
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Forbidden: User role is not teacher",
		})
		return
	}

	classIDHex := mux.Vars(r)["id"]
	classID, err := primitive.ObjectIDFromHex(classIDHex)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("DELETE", "/user/classes/{id}", "400").Inc()
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Invalid class ID format",
		})
		return
	}

	ownerID, err := primitive.ObjectIDFromHex(claims.UserID)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("DELETE", "/user/classes/{id}", "400").Inc()
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Invalid user ID format",
		})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var class models.Class
	err = db.ClassCollection.FindOne(ctx, bson.M{"_id": classID}).Decode(&class)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("DELETE", "/user/classes/{id}", "404").Inc()
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Class not found",
		})
		return
	}

	if class.OwnerID != ownerID {
		metrics.HTTPRequestsTotal.WithLabelValues("DELETE", "/user/classes/{id}", "403").Inc()
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "You don't have permission to delete this class",
		})
		return
	}

	res, err := db.ClassCollection.DeleteOne(ctx, bson.M{
		"_id":      classID,
		"owner_id": ownerID,
	})
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("DELETE", "/user/classes/{id}", "500").Inc()
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Delete failed",
		})
		return
	}

	if res.DeletedCount == 0 {
		metrics.HTTPRequestsTotal.WithLabelValues("DELETE", "/user/classes/{id}", "404").Inc()
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Class not found or not owned",
		})
		return
	}

	metrics.ActiveClasses.Dec()
	metrics.HTTPRequestsTotal.WithLabelValues("DELETE", "/user/classes/{id}", "200").Inc()
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Class successfully deleted",
	})
}

// GET /user/classes/{classId}/performance-trends
func GetClassPerformanceTrends(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	if claims.Role != string(models.RoleTeacher) && claims.Role != string(models.RoleAdmin) {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "403").Inc()
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	classID := mux.Vars(r)["classId"]
	classOID, err := primitive.ObjectIDFromHex(classID)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "Invalid class ID", http.StatusBadRequest)
		return
	}

	timeRange := r.URL.Query().Get("timeRange")
	if timeRange == "" {
		timeRange = "8-weeks"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var class models.Class
	if err := db.ClassCollection.FindOne(ctx, bson.M{"_id": classOID}).Decode(&class); err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "404").Inc()
		http.Error(w, "Class not found", http.StatusNotFound)
		return
	}

	cursor, err := db.UserCollection.Find(ctx, bson.M{"_id": bson.M{"$in": class.Students}})
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Failed to fetch students", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var students []models.User
	if err := cursor.All(ctx, &students); err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Failed to decode students", http.StatusInternalServerError)
		return
	}

	type PeriodData struct {
		Scores []float64
	}
	performanceByPeriod := make(map[string]*PeriodData)

	now := time.Now()
	var startTime time.Time

	switch timeRange {
	case "4-weeks":
		startTime = now.AddDate(0, 0, -28) // 4 weeks ago
	case "8-weeks":
		startTime = now.AddDate(0, 0, -56) // 8 weeks ago
	case "12-weeks":
		startTime = now.AddDate(0, 0, -84) // 12 weeks ago
	case "semester":
		startTime = now.AddDate(0, 0, -126) // 18 weeks ago
	default:
		startTime = now.AddDate(0, 0, -56) // Default to 8 weeks
	}

	for _, student := range students {
		for _, qr := range student.QuizResults {
			if qr.MaxScore > 0 && qr.Timestamp.After(startTime) && qr.Timestamp.Before(now) {
				scorePercentage := float64(qr.Score) / float64(qr.MaxScore) * 100

				periodString := ""
				if timeRange == "semester" {
					periodString = qr.Timestamp.Format("Jan 2006")
				} else {
					_, week := qr.Timestamp.ISOWeek()
					year := qr.Timestamp.Year()
					periodString = fmt.Sprintf("Săptămâna %d-%d", week, year)
				}

				if _, ok := performanceByPeriod[periodString]; !ok {
					performanceByPeriod[periodString] = &PeriodData{}
				}
				performanceByPeriod[periodString].Scores = append(performanceByPeriod[periodString].Scores, scorePercentage)
			}
		}
	}

	var trendData []models.QuizPerformanceTrendEntry

	var periods []string
	for p := range performanceByPeriod {
		periods = append(periods, p)
	}
	sort.Strings(periods)

	for _, period := range periods {
		data := performanceByPeriod[period]
		if len(data.Scores) == 0 {
			continue
		}

		totalScore := 0.0
		minScore := 101.0
		maxScore := -1.0
		for _, s := range data.Scores {
			totalScore += s
			if s < minScore {
				minScore = s
			}
			if s > maxScore {
				maxScore = s
			}
		}

		avg := totalScore / float64(len(data.Scores))

		trendData = append(trendData, models.QuizPerformanceTrendEntry{
			Period:          period,
			Average:         avg,
			TopPerformer:    maxScore,
			LowestPerformer: minScore,
		})
	}

	metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "200").Inc()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(trendData)
}

// GET /user/classes/{classId}/most-improved-students
func GetMostImprovedStudentsInClass(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	if claims.Role != string(models.RoleTeacher) && claims.Role != string(models.RoleAdmin) {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "403").Inc()
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	classID := mux.Vars(r)["classId"]
	classOID, err := primitive.ObjectIDFromHex(classID)
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "400").Inc()
		http.Error(w, "Invalid class ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var class models.Class
	if err := db.ClassCollection.FindOne(ctx, bson.M{"_id": classOID}).Decode(&class); err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "404").Inc()
		http.Error(w, "Class not found", http.StatusNotFound)
		return
	}

	cursor, err := db.UserCollection.Find(ctx, bson.M{"_id": bson.M{"$in": class.Students}})
	if err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Failed to fetch students", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var students []models.User
	if err := cursor.All(ctx, &students); err != nil {
		metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "500").Inc()
		http.Error(w, "Failed to decode students", http.StatusInternalServerError)
		return
	}

	var improvedStudents = make([]models.MostImprovedStudent, 0)

	for _, student := range students {
		log.Printf("Processing student %s (%s) for most improved.", student.Email, student.ID.Hex())
		var validQuizResults []models.QuizResultMeta
		for _, qr := range student.QuizResults {
			if qr.MaxScore > 0 {
				validQuizResults = append(validQuizResults, qr)
			}
		}

		if len(validQuizResults) < 2 {
			log.Printf("  Student %s (%s): Not enough valid quiz results (%d) to determine improvement. Skipping.", student.Email, student.ID.Hex(), len(validQuizResults))
			continue
		}

		sort.Slice(validQuizResults, func(i, j int) bool {
			return validQuizResults[i].Timestamp.Before(validQuizResults[j].Timestamp)
		})

		initialQuiz := validQuizResults[0]
		currentQuiz := validQuizResults[len(validQuizResults)-1]

		initialScorePercentage := (float64(initialQuiz.Score) / float64(initialQuiz.MaxScore)) * 100
		currentScorePercentage := (float64(currentQuiz.Score) / float64(currentQuiz.MaxScore)) * 100

		improvementValue := currentScorePercentage - initialScorePercentage

		log.Printf("  Student %s (%s): Initial Score: %.2f%% (QuizID: %s), Current Score: %.2f%% (QuizID: %s), Improvement: %.2f%%",
			student.Email, student.ID.Hex(), initialScorePercentage, initialQuiz.QuizID.Hex(), currentScorePercentage, currentQuiz.QuizID.Hex(), improvementValue)

		if improvementValue > 0 {
			improvedStudents = append(improvedStudents, models.MostImprovedStudent{
				ID:           student.ID,
				Name:         student.Email,
				Email:        student.Email,
				InitialScore: initialScorePercentage,
				CurrentScore: currentScorePercentage,
				Improvement:  improvementValue,
			})
		}
	}

	sort.Slice(improvedStudents, func(i, j int) bool {
		return improvedStudents[i].Improvement > improvedStudents[j].Improvement
	})

	if len(improvedStudents) > 5 {
		improvedStudents = improvedStudents[:5]
	}

	log.Printf("GetMostImprovedStudentsInClass: Returning %d improved students. Data: %+v", len(improvedStudents), improvedStudents)

	metrics.HTTPRequestsTotal.WithLabelValues("GET", utils.NormalizePath(r.URL.Path), "200").Inc()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(improvedStudents)
}
