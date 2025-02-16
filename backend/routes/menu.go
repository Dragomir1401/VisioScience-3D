package routes

import (
	"encoding/json"
	"net/http"
)

type SupportedSubjects struct {
	Subjects []string `json:"subjects"`
}

func NewSupportedSubjects() SupportedSubjects {
	return SupportedSubjects{
		Subjects: []string{"Matematica", "Fizica", "Chimie", "Astronomie", "Other"},
	}
}

// MenuHandler serveste meniul principal cu materiile
func MenuHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	json.NewEncoder(w).Encode(NewSupportedSubjects())
}
