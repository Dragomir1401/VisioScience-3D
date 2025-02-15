# Dockerfile pentru Backend (Go)
FROM golang:1.20
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main .
CMD ["/app/main"]
EXPOSE 8080