# Start from Go base image
FROM golang:1.21-alpine

WORKDIR /app

# Install git (needed for go get) and ca-certificates for HTTPS
RUN apk update && apk add --no-cache git ca-certificates && update-ca-certificates

COPY go.mod ./
COPY go.sum ./
RUN go mod download

COPY . .

RUN go build -o formulas_service

EXPOSE 8080

CMD ["./formulas_service"]
