package models

type ExecutionState struct {
	Type        string      `json:"type"`
	Name        string      `json:"name"`
	State       interface{} `json:"state"`
	Metadata    Metadata    `json:"metadata"`
	Operation   string      `json:"operation"`
	Description string      `json:"description"`
	Timestamp   int64       `json:"timestamp"`
}

type Metadata struct {
	Size        int    `json:"size"`
	Capacity    int    `json:"capacity"`
	Empty       bool   `json:"empty"`
	ElementType string `json:"element_type"`
}

type ExecutionOutput struct {
	States []ExecutionState `json:"states"`
}

type CodeExecutionRequest struct {
	Code  string `json:"code"`
	Input string `json:"input"`
}

type CodeExecutionResponse struct {
	Output        string          `json:"output"`
	Error         string          `json:"error"`
	Success       bool            `json:"success"`
	ExecutionData []ExecutionStep `json:"executionData"`
}

type ExecutionStep struct {
	Type        string      `json:"type"`
	Name        string      `json:"name"`
	State       interface{} `json:"state"`
	Metadata    Metadata    `json:"metadata"`
	Operation   string      `json:"operation"`
	Description string      `json:"description"`
	Timestamp   int64       `json:"timestamp"`
}
