package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/exec"
	"time"

	gorillaHandlers "github.com/gorilla/handlers"
)

type CodeExecutionRequest struct {
	Code  string `json:"code"`
	Input string `json:"input"`
}

type CodeExecutionResponse struct {
	Output        string        `json:"output"`
	Error         string        `json:"error"`
	Success       bool          `json:"success"`
	ExecutionData []interface{} `json:"execution_data"`
}

func compileAndRun(w http.ResponseWriter, r *http.Request) {
	log.Println("[compileAndRun] Received request")
	w.Header().Set("Content-Type", "application/json")

	var req CodeExecutionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	tmpDir, err := os.MkdirTemp("", "cpp-exec-*")
	if err != nil {
		http.Error(w, "Failed to create temp dir: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer os.RemoveAll(tmpDir)

	codeFile := tmpDir + "/main.cpp"
	execFile := tmpDir + "/a.out"

	if err := os.WriteFile(codeFile, []byte(req.Code), 0644); err != nil {
		http.Error(w, "Failed to write code file: "+err.Error(), http.StatusInternalServerError)
		return
	}

	log.Println("[compileAndRun] Compiling code...")
	compileCmd := exec.Command("g++", codeFile, "-o", execFile)
	var compileErr bytes.Buffer
	compileCmd.Stderr = &compileErr

	err = compileCmd.Run()
	if err != nil {
		log.Println("[compileAndRun] Compilation error:", compileErr.String())
		json.NewEncoder(w).Encode(CodeExecutionResponse{
			Output:  "",
			Error:   "Compilation failed: " + compileErr.String(),
			Success: false,
		})
		return
	}

	log.Println("[compileAndRun] Running executable...")
	runCmd := exec.Command(execFile)
	runCmd.Stdin = bytes.NewBufferString(req.Input)
	var runOutput bytes.Buffer
	var runErr bytes.Buffer
	runCmd.Stdout = &runOutput
	runCmd.Stderr = &runErr

	runErrCh := make(chan error, 1)
	go func() {
		runErrCh <- runCmd.Run()
	}()

	select {
	case err := <-runErrCh:
		if err != nil {
			log.Println("[compileAndRun] Execution error:", runErr.String())
			json.NewEncoder(w).Encode(CodeExecutionResponse{
				Output:  runOutput.String(),
				Error:   "Execution failed: " + runErr.String() + err.Error(),
				Success: false,
			})
			return
		}
	case <-time.After(10 * time.Second):
		log.Println("[compileAndRun] Execution timed out")
		runCmd.Process.Kill()
		json.NewEncoder(w).Encode(CodeExecutionResponse{
			Output:  runOutput.String(),
			Error:   "Execution timed out after 10 seconds",
			Success: false,
		})
		return
	}

	log.Println("[compileAndRun] Execution successful")
	json.NewEncoder(w).Encode(CodeExecutionResponse{
		Output:        runOutput.String(),
		Error:         runErr.String(),
		Success:       true,
		ExecutionData: []interface{}{},
	})
}

func main() {
	r := http.NewServeMux()
	r.HandleFunc("/cpp-compiler/compile-run", compileAndRun)

	// CORS middleware to accept all origins for development purposes
	corsObj := gorillaHandlers.CORS(
		gorillaHandlers.AllowedOrigins([]string{"*"}),
		gorillaHandlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		gorillaHandlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)

	log.Println("C++ Compiler Service running on :8081")
	log.Fatal(http.ListenAndServe(":8081", corsObj(r)))
}
