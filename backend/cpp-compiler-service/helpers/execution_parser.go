package helpers

import (
	"cpp-compiler-service/models"
	"encoding/json"
	"log"
	"strings"
)

// ParseExecutionOutput takes the raw output from a C++ program and parses it into execution steps
func ParseExecutionOutput(rawOutput string) (*models.ExecutionOutput, error) {
	log.Printf("[ParseExecutionOutput] Raw input: %s", rawOutput)

	output := &models.ExecutionOutput{
		States: make([]models.ExecutionState, 0),
	}

	// Split the output into lines
	lines := strings.Split(rawOutput, "\n")

	// Process each line
	for _, line := range lines {
		// Trim all whitespace (spaces and tabs) from both ends
		line = strings.TrimSpace(line)
		// Skip empty lines and comments (after trimming whitespace)
		if line == "" || strings.HasPrefix(line, "//") {
			continue
		}

		log.Printf("[ParseExecutionOutput] Processing line: %s", line)

		// Parse the JSON directly since we've already removed the STATE: prefix
		var state models.ExecutionState
		if err := json.Unmarshal([]byte(line), &state); err != nil {
			log.Printf("[ParseExecutionOutput] Error unmarshaling state: %v", err)
			continue // Skip this line but continue processing others
		}

		log.Printf("[ParseExecutionOutput] Parsed state: %+v", state)
		output.States = append(output.States, state)
	}

	log.Printf("[ParseExecutionOutput] Final output: %+v", output)
	return output, nil
}

// ConvertToExecutionSteps converts ExecutionOutput to ExecutionSteps
func ConvertToExecutionSteps(output *models.ExecutionOutput) []models.ExecutionStep {
	log.Printf("[ConvertToExecutionSteps] Input: %+v", output)

	steps := make([]models.ExecutionStep, len(output.States))

	for i, state := range output.States {
		steps[i] = models.ExecutionStep{
			Type:        state.Type,
			Name:        state.Name,
			State:       state.State,
			Metadata:    state.Metadata,
			Operation:   state.Operation,
			Description: state.Description,
			Timestamp:   state.Timestamp,
		}
	}

	log.Printf("[ConvertToExecutionSteps] Output: %+v", steps)
	return steps
}
