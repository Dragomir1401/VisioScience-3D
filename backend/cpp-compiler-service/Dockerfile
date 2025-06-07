FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod tidy
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/main .

FROM alpine:latest
RUN apk --no-cache add g++
WORKDIR /app
COPY --from=builder /app/main .
EXPOSE 8081
CMD ["./main"]