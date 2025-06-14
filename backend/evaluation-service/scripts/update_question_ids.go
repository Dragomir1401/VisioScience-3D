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
	// Get the evaluation service URL from environment or use default
	evalServiceURL := "http://localhost:8000"

	// Create HTTP client with timeout
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	// Make the request to update question IDs
	url := fmt.Sprintf("%s/evaluation/quiz/update-question-ids", evalServiceURL)
	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		log.Fatalf("Error creating request: %v", err)
	}

	// Add authorization header
	req.Header.Set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjdmMDQ4NWU3NjY0MWFmNDJmYmY3Mzg1Iiwicm9sZSI6InRlYWNoZXIiLCJleHAiOjE3NDk5MjQwMDB9.8QZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ")

	// Send the request
	resp, err := client.Do(req)
	if err != nil {
		log.Fatalf("Error making request: %v", err)
	}
	defer resp.Body.Close()

	// Check response
	if resp.StatusCode != http.StatusOK {
		log.Printf("Request failed with status: %d", resp.StatusCode)
		log.Printf("Response headers: %v", resp.Header)
		body, _ := io.ReadAll(resp.Body)
		log.Printf("Response body: %s", string(body))
		os.Exit(1)
	}

	log.Println("Successfully triggered question IDs update")
}
