package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	"user-data-service/models"
	db "user-data-service/mongo"

	"user-data-service/utils"

	"github.com/gorilla/mux"
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
		StudentID string `json:"student_id"`
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

	var class models.Class
	if err := db.ClassCollection.FindOne(ctx, bson.M{
		"_id":      classOID,
		"owner_id": claims.UserID,
	}).Decode(&class); err != nil {
		http.Error(w, "Class not found or not owned", http.StatusForbidden)
		return
	}

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

func GetClassStudents(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	if claims.Role != string(models.RoleTeacher) {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	classIDHex := mux.Vars(r)["id"]
	classID, err := primitive.ObjectIDFromHex(classIDHex)
	if err != nil {
		http.Error(w, "Invalid class ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var class models.Class
	if err := db.ClassCollection.FindOne(ctx, bson.M{"_id": classID}).Decode(&class); err != nil {
		http.Error(w, "Class not found", http.StatusNotFound)
		return
	}

	cursor, err := db.UserCollection.Find(ctx, bson.M{"_id": bson.M{"$in": class.Students}})
	if err != nil {
		http.Error(w, "Error fetching students", http.StatusInternalServerError)
		return
	}

	var students []models.User
	if err := cursor.All(ctx, &students); err != nil {
		http.Error(w, "Cursor error", http.StatusInternalServerError)
		return
	}

	for i := range students {
		students[i].Password = ""
	}

	json.NewEncoder(w).Encode(students)
}

func RemoveStudentFromClass(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	if claims.Role != string(models.RoleTeacher) {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	classID := mux.Vars(r)["id"]
	studentID := mux.Vars(r)["studentId"]

	classOID, err := primitive.ObjectIDFromHex(classID)
	if err != nil {
		http.Error(w, "Invalid class ID", http.StatusBadRequest)
		return
	}

	studentOID, err := primitive.ObjectIDFromHex(studentID)
	if err != nil {
		http.Error(w, "Invalid student ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	update := bson.M{"$pull": bson.M{"students": studentOID}}

	_, err = db.ClassCollection.UpdateByID(ctx, classOID, update)
	if err != nil {
		http.Error(w, "Failed to remove student", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Student removed"})
}

// GET /user/classes/{classId}/quiz/{quizId}/results
func GetClassQuizResults(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("claims").(*utils.CustomClaims)
	if claims.Role != string(models.RoleTeacher) {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	classIDHex := mux.Vars(r)["classId"]
	quizIDHex := mux.Vars(r)["quizId"]
	classID, err := primitive.ObjectIDFromHex(classIDHex)
	if err != nil {
		http.Error(w, "Invalid class ID", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var class models.Class
	if err := db.ClassCollection.FindOne(ctx, bson.M{"_id": classID}).Decode(&class); err != nil {
		http.Error(w, "Class not found", http.StatusNotFound)
		return
	}

	cursor, err := db.UserCollection.Find(ctx, bson.M{"_id": bson.M{"$in": class.Students}})
	if err != nil {
		http.Error(w, "Error fetching students", http.StatusInternalServerError)
		return
	}
	var users []models.User
	if err := cursor.All(ctx, &users); err != nil {
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
		http.Error(w, "Error contacting evaluation service", http.StatusInternalServerError)
		return
	}
	defer respEval.Body.Close()

	if respEval.StatusCode != http.StatusOK {
		body, _ := ioutil.ReadAll(respEval.Body)
		http.Error(w, string(body), respEval.StatusCode)
		return
	}

	var evalResults []struct {
		UserID      primitive.ObjectID `json:"user_id"`
		Score       int                `json:"score"`
		SubmittedAt time.Time          `json:"submitted_at"`
	}
	if err := json.NewDecoder(respEval.Body).Decode(&evalResults); err != nil {
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

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(out)
}
