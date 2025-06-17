package helpers

import (
	"cpp-compiler-service/models"
	"encoding/json"
	"log"
	"strings"
)

func ParseExecutionOutput(rawOutput string) (*models.ExecutionOutput, error) {
	log.Printf("[ParseExecutionOutput] Raw input: %s", rawOutput)

	output := &models.ExecutionOutput{
		States: make([]models.ExecutionState, 0),
	}

	lines := strings.Split(rawOutput, "\n")

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "//") {
			continue
		}

		log.Printf("[ParseExecutionOutput] Processing line: %s", line)

		var state models.ExecutionState
		if err := json.Unmarshal([]byte(line), &state); err != nil {
			log.Printf("[ParseExecutionOutput] Error unmarshaling state: %v", err)
			continue
		}

		log.Printf("[ParseExecutionOutput] Parsed state: %+v", state)
		output.States = append(output.States, state)
	}

	log.Printf("[ParseExecutionOutput] Final output: %+v", output)
	return output, nil
}

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
