package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
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

	// Print response for debugging
	t.Logf("Response: %+v", response)

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

	// Print execution data for debugging
	for i, step := range response.ExecutionData {
		t.Logf("Step %d: Type=%s, Name=%s, Operation=%s, Description=%s, State=%s",
			i, step.Type, step.Name, step.Operation, step.Description, step.State)
	}
}
