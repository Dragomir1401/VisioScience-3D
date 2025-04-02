package middleware

import (
	"context"
	"net/http"
	"strings"
	"user-data-service/utils"
)

type contextKey string

func JWTAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Missing Authorization header", http.StatusUnauthorized)
			return
		}

		ctx := r.Context()

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, "Invalid Authorization header format", http.StatusUnauthorized)
			return
		}
		tokenStr := parts[1]

		claims, err := utils.ValidateToken(tokenStr)
		if err != nil {
			http.Error(w, "Invalid token: "+err.Error(), http.StatusUnauthorized)
			return
		}
		ctx = context.WithValue(ctx, contextKey("userID"), claims.UserID)
		ctx = context.WithValue(ctx, contextKey("role"), claims.Role)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
