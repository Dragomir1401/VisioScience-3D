package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"
)

func main() {
	evalServiceURL := "http://localhost:8000"

	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	url := fmt.Sprintf("%s/evaluation/quiz/add-mock-answers", evalServiceURL)
	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		log.Fatalf("Error creating request: %v", err)
	}

	req.Header.Set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjgxZTc4OTI4Nzg3NzI5NDJjNzA0Mzk1Iiwicm9sZSI6IkVMRVYiLCJlbWFpbCI6ImJAeWFob28uY29tIiwiZXhwIjoxNzUwMDE4NjkzLCJpYXQiOjE3NDk5MzIyOTN9.Qhpp89_-jXikUyzt_qHQzIVwYwDmViaX6nF9Pd45W74")

	resp, err := client.Do(req)
	if err != nil {
		log.Fatalf("Error making request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Request failed with status: %d", resp.StatusCode)
		log.Printf("Response headers: %v", resp.Header)
		body, _ := io.ReadAll(resp.Body)
		log.Printf("Response body: %s", string(body))
		os.Exit(1)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatalf("Error reading response: %v", err)
	}
	log.Printf("Response: %s", string(body))
	log.Println("Successfully added mock answers to questions")
}
