package models

type AuthResponse struct {
	Token string `json:"token"`
	ID    string `json:"id"`
}
