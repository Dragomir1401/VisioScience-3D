package utils

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

type CustomClaims struct {
	UserID string `json:"user_id"`
	Role   string `json:"role"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

func getJwtSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "fallback-hardcoded"
	}
	return []byte(secret)
}

func GenerateToken(userID, role, email string) (string, error) {
	claims := CustomClaims{
		UserID: userID,
		Role:   role,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(getJwtSecret())
}

func ParseToken(tokenString string) (*CustomClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return getJwtSecret(), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*CustomClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}
