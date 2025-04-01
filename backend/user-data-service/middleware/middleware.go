package middleware

import (
    "net/http"
    "user-data-service/utils"
    "strings"
    "github.com/gorilla/mux"
)

func JWTAuth(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        authHeader := r.Header.Get("Authorization")
        if authHeader == "" {
            http.Error(w, "Missing Authorization header", http.StatusUnauthorized)
            return
        }

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

        ctx := r.Context()
        ctx = context.WithValue(ctx, "userID", claims.UserID)
        ctx = context.WithValue(ctx, "role", claims.Role)

        next.ServeHTTP(w, r.WithContext(ctx))
    })
}
