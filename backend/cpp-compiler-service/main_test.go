package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"cpp-compiler-service/models"
)

func TestCompileAndRun(t *testing.T) {
	// Read test code from main.cpp
	testCode, err := os.ReadFile("test/main.cpp")
	if err != nil {
		t.Fatalf("Failed to read test code: %v", err)
	}

	// Create request body
	reqBody := models.CodeExecutionRequest{
		Code: string(testCode),
	}
	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		t.Fatalf("Failed to marshal request body: %v", err)
	}

	// Create test request
	req := httptest.NewRequest("POST", "/compile", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")

	// Create response recorder
	w := httptest.NewRecorder()

	// Call the handler
	compileAndRun(w, req)

	// Check response status code
	if w.Code != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, w.Code)
	}

	// Parse response
	var response models.CodeExecutionResponse
	if err := json.NewDecoder(w.Body).Decode(&response); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	// Print response details with clear separation
	t.Log("\n=== TEST RESULTS ===")

	// Print program output
	t.Log("\n--- Program Output ---")
	if response.Output != "" {
		outputLines := strings.Split(response.Output, "\n")
		for _, line := range outputLines {
			if line != "" {
				t.Logf("> %s", line)
			}
		}
	} else {
		t.Log("(no output)")
	}

	// Print error if any
	if response.Error != "" {
		t.Log("\n--- Error ---")
		t.Logf("> %s", response.Error)
	}

	// Print execution data
	t.Log("\n--- Execution Steps ---")
	if len(response.ExecutionData) > 0 {
		for i, step := range response.ExecutionData {
			t.Logf("\nStep %d:", i+1)
			t.Logf("  Type: %s", step.Type)
			t.Logf("  Name: %s", step.Name)
			t.Logf("  Operation: %s", step.Operation)
			t.Logf("  Description: %s", step.Description)
			t.Logf("  State: %s", step.State)
			if !step.Metadata.Empty {
				metadataJson, _ := json.Marshal(step.Metadata)
				t.Logf("  Metadata: %s", string(metadataJson))
			}
		}
	} else {
		t.Log("(no execution steps)")
	}

	t.Log("\n=== END OF TEST RESULTS ===\n")

	// Basic assertions
	if !response.Success {
		t.Errorf("Expected success=true, got success=%v", response.Success)
	}

	if response.Error != "" {
		t.Errorf("Expected no error, got: %s", response.Error)
	}

	// Check if we got any execution data
	if len(response.ExecutionData) == 0 {
		t.Error("Expected execution data, got none")
	}
}
