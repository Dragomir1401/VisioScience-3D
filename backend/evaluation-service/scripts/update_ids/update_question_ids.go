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

	url := fmt.Sprintf("%s/evaluation/quiz/update-question-ids", evalServiceURL)
	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		log.Fatalf("Error creating request: %v", err)
	}

	req.Header.Set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjdmMDQ4NWU3NjY0MWFmNDJmYmY3Mzg1Iiwicm9sZSI6InRlYWNoZXIiLCJleHAiOjE3NDk5MjQwMDB9.8QZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ")

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

	log.Println("Successfully triggered question IDs update")
}
