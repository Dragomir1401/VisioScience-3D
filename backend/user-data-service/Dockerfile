FROM golang:1.21-alpine

WORKDIR /app

RUN apk update && apk add --no-cache git ca-certificates && update-ca-certificates

COPY go.mod ./
COPY go.sum ./
RUN go mod download

COPY . .

RUN go build -o user-data-service

EXPOSE 8080

CMD ["./user-data-service"]
