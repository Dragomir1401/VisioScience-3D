package utils

import (
	"math/rand"
	"time"
)

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func GenerateClassCode() string {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))

	code := make([]byte, 6)
	for i := range code {
		code[i] = letters[r.Intn(len(letters))]
	}
	return "CL-" + string(code)
}
