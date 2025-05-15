package endpoints

import (
	"encoding/json"
	"net/http"

	"evaluation-service/helpers"
	"evaluation-service/models"

	"github.com/gorilla/mux"
	"github.com/prometheus/client_golang/prometheus"
)

var (
	quizOperations = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "quiz_operations_total",
			Help: "Total number of quiz operations",
		},
		[]string{"operation", "class_id"},
	)

	activeQuizzes = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "active_quizzes",
			Help: "Number of active quizzes",
		},
	)

	quizAttempts = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "quiz_attempts_total",
			Help: "Total number of quiz attempts",
		},
		[]string{"quiz_id", "status"},
	)

	quizResults = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "quiz_results",
			Help:    "Distribution of quiz results",
			Buckets: []float64{0, 20, 40, 60, 80, 100},
		},
		[]string{"quiz_id"},
	)
)

func init() {
	prometheus.MustRegister(quizOperations)
	prometheus.MustRegister(activeQuizzes)
	prometheus.MustRegister(quizAttempts)
	prometheus.MustRegister(quizResults)
}

func CreateQuiz(w http.ResponseWriter, r *http.Request) {
	var quiz models.Quiz
	if err := json.NewDecoder(r.Body).Decode(&quiz); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := helpers.CreateQuiz(quiz); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	quizOperations.WithLabelValues("create", quiz.ClassID).Inc()
	activeQuizzes.Inc()

	w.WriteHeader(http.StatusCreated)
}

func GetQuizByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["quiz_id"]

	quiz, err := helpers.GetQuizByID(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	quizOperations.WithLabelValues("get", quiz.ClassID).Inc()

	json.NewEncoder(w).Encode(quiz)
}

func UpdateQuiz(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var quiz models.Quiz
	if err := json.NewDecoder(r.Body).Decode(&quiz); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := helpers.UpdateQuiz(id, quiz); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	quizOperations.WithLabelValues("update", quiz.ClassID).Inc()

	w.WriteHeader(http.StatusOK)
}

func DeleteQuiz(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	quiz, err := helpers.GetQuizByID(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	if err := helpers.DeleteQuiz(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	quizOperations.WithLabelValues("delete", quiz.ClassID).Inc()
	activeQuizzes.Dec()

	w.WriteHeader(http.StatusOK)
}

func GetQuizzesByClass(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	classID := vars["class_id"]

	quizzes, err := helpers.GetQuizzesByClass(classID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	quizOperations.WithLabelValues("list", classID).Inc()

	json.NewEncoder(w).Encode(quizzes)
}

func GetQuizForAttempt(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	quizID := vars["quizId"]

	quiz, err := helpers.GetQuizForAttempt(quizID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	quizOperations.WithLabelValues("attempt", quiz.ClassID).Inc()

	json.NewEncoder(w).Encode(quiz)
}

func SubmitAttempt(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	quizID := vars["quizId"]

	var attempt models.QuizAttempt
	if err := json.NewDecoder(r.Body).Decode(&attempt); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	score, err := helpers.SubmitAttempt(quizID, attempt)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	quizAttempts.WithLabelValues(quizID, "completed").Inc()
	quizResults.WithLabelValues(quizID).Observe(float64(score))

	json.NewEncoder(w).Encode(map[string]interface{}{
		"score": score,
	})
}

func GetLastResult(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	quizID := vars["quizId"]
	userID := vars["userId"]

	result, err := helpers.GetLastResult(quizID, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	quizOperations.WithLabelValues("result", result.ClassID).Inc()

	json.NewEncoder(w).Encode(result)
}

func GetQuizResults(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	quizID := vars["quizId"]

	results, err := helpers.GetQuizResults(quizID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	quizOperations.WithLabelValues("results", results[0].ClassID).Inc()

	json.NewEncoder(w).Encode(results)
}

func SetQuizStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var status struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&status); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	quiz, err := helpers.GetQuizByID(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	if err := helpers.SetQuizStatus(id, status.Status); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	quizOperations.WithLabelValues("status", quiz.ClassID).Inc()

	w.WriteHeader(http.StatusOK)
}
