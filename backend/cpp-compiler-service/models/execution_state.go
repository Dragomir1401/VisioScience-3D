package models

// ExecutionState represents the state of a data structure at a point in time
type ExecutionState struct {
	Type        string      `json:"type"`  // Type of data structure (e.g., "array", "linked_list", "tree")
	Name        string      `json:"name"`  // Name/identifier of the data structure
	State       interface{} `json:"state"` // Current state of the data structure
	Metadata    Metadata    `json:"metadata"`
	Operation   string      `json:"operation"`   // Operation being performed
	Description string      `json:"description"` // Human-readable description of the operation
	Timestamp   int64       `json:"timestamp"`
}

// Metadata contains additional information about the data structure
type Metadata struct {
	Size        int    `json:"size"`
	Capacity    int    `json:"capacity"`
	Empty       bool   `json:"empty"`
	ElementType string `json:"element_type"`
}

// ExecutionOutput represents the raw output from the program execution
type ExecutionOutput struct {
	States []ExecutionState `json:"states"`
}

// CodeExecutionRequest represents a request to compile and run C++ code
type CodeExecutionRequest struct {
	Code  string `json:"code"`
	Input string `json:"input"`
}

// CodeExecutionResponse represents the response from compiling and running C++ code
type CodeExecutionResponse struct {
	Output        string          `json:"output"`
	Error         string          `json:"error"`
	Success       bool            `json:"success"`
	ExecutionData []ExecutionStep `json:"executionData"`
}

// ExecutionStep represents a single step in the execution of the program
type ExecutionStep struct {
	Type        string      `json:"type"`
	Name        string      `json:"name"`
	State       interface{} `json:"state"`
	Metadata    Metadata    `json:"metadata"`
	Operation   string      `json:"operation"`
	Description string      `json:"description"`
	Timestamp   int64       `json:"timestamp"`
}
