package main

import (
	"bytes"
	"cpp-compiler-service/helpers"
	"cpp-compiler-service/models"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	gorillaHandlers "github.com/gorilla/handlers"
)

func compileAndRun(w http.ResponseWriter, r *http.Request) {
	log.Println("[compileAndRun] Received request")
	w.Header().Set("Content-Type", "application/json")

	var req models.CodeExecutionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Transform the code to use our tracing system
	transformedCode := helpers.TransformCode(req.Code)

	tmpDir, err := os.MkdirTemp("", "cpp-exec-*")
	if err != nil {
		http.Error(w, "Failed to create temp dir: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer os.RemoveAll(tmpDir)

	// Copy tracer files to temp directory
	tracerDir := filepath.Join(tmpDir, "tracer")
	if err := os.Mkdir(tracerDir, 0755); err != nil {
		http.Error(w, "Failed to create tracer dir: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Write tracer files
	if err := os.WriteFile(filepath.Join(tracerDir, "tracer.h"), []byte(tracerHeader), 0644); err != nil {
		http.Error(w, "Failed to write tracer.h: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if err := os.WriteFile(filepath.Join(tracerDir, "tracer.cpp"), []byte(tracerImpl), 0644); err != nil {
		http.Error(w, "Failed to write tracer.cpp: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Write main code
	codeFile := filepath.Join(tmpDir, "main.cpp")
	if err := os.WriteFile(codeFile, []byte(transformedCode), 0644); err != nil {
		http.Error(w, "Failed to write code file: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Compile the code with the correct include path
	log.Println("[compileAndRun] Compiling code...")
	compileCmd := exec.Command("g++",
		"-std=c++17",
		"-I"+tracerDir, // Add the tracer directory to include path
		codeFile,
		filepath.Join(tracerDir, "tracer.cpp"),
		"-o", filepath.Join(tmpDir, "a.out"))
	var compileErr bytes.Buffer
	compileCmd.Stderr = &compileErr

	err = compileCmd.Run()
	if err != nil {
		log.Println("[compileAndRun] Compilation error:", compileErr.String())
		json.NewEncoder(w).Encode(models.CodeExecutionResponse{
			Output:        "",
			Error:         "Compilation failed: " + compileErr.String(),
			Success:       false,
			ExecutionData: []models.ExecutionStep{},
		})
		return
	}

	// Run the executable
	log.Println("[compileAndRun] Running executable...")
	runCmd := exec.Command(filepath.Join(tmpDir, "a.out"))
	runCmd.Stdin = bytes.NewBufferString(req.Input)
	var runOutput bytes.Buffer
	var runErr bytes.Buffer
	runCmd.Stdout = &runOutput
	runCmd.Stderr = &runErr

	runErrCh := make(chan error, 1)
	go func() {
		runErrCh <- runCmd.Run()
	}()

	var executionSteps []models.ExecutionStep
	var outputStr string
	var errorStr string
	var success bool

	select {
	case err := <-runErrCh:
		if err != nil {
			log.Println("[compileAndRun] Execution error:", runErr.String())
			outputStr = runOutput.String()
			errorStr = "Execution failed: " + runErr.String() + err.Error()
			success = false
		} else {
			outputStr = runOutput.String()
			errorStr = runErr.String()
			success = true
		}
	case <-time.After(10 * time.Second):
		log.Println("[compileAndRun] Execution timed out")
		runCmd.Process.Kill()
		outputStr = runOutput.String()
		errorStr = "Execution timed out after 10 seconds"
		success = false
	}

	// Parse execution output if we have any
	if outputStr != "" {
		log.Printf("[compileAndRun] Raw output: %s", outputStr)

		// Split output into program output and execution data
		var programOutput strings.Builder
		var executionData strings.Builder

		for _, line := range strings.Split(outputStr, "\n") {
			line = strings.TrimSpace(line)
			if line == "" {
				continue
			}

			log.Printf("[compileAndRun] Processing line: %s", line)

			// Check if the line contains a state marker
			if strings.HasPrefix(line, "STATE:") {
				// Extract the state data
				stateData := line[6:] // Skip "STATE:"
				executionData.WriteString(stateData)
				executionData.WriteString("\n")
			} else if !strings.Contains(line, "STATE:") &&
				!strings.Contains(line, "size=") &&
				!strings.Contains(line, "step '") &&
				!strings.HasPrefix(line, "(skip)") &&
				!strings.HasPrefix(line, "[find]") &&
				!strings.HasPrefix(line, "[erase]") {
				// Only add to program output if it doesn't contain debug info
				programOutput.WriteString(line)
				programOutput.WriteString("\n")
			}
		}

		// Parse execution data
		if executionData.Len() > 0 {
			log.Printf("[compileAndRun] Execution data to parse: %s", executionData.String())
			execOutput, err := helpers.ParseExecutionOutput(executionData.String())
			if err != nil {
				log.Printf("[compileAndRun] Error parsing execution output: %v", err)
			} else {
				executionSteps = helpers.ConvertToExecutionSteps(execOutput)
				log.Printf("[compileAndRun] Parsed execution steps: %+v", executionSteps)
			}
		} else {
			log.Println("[compileAndRun] No execution data found")
		}

		// Set the actual program output
		outputStr = strings.TrimSpace(programOutput.String())
		log.Printf("[compileAndRun] Final program output: %s", outputStr)
	}

	log.Println("[compileAndRun] Sending response")
	json.NewEncoder(w).Encode(models.CodeExecutionResponse{
		Output:        outputStr,
		Error:         errorStr,
		Success:       success,
		ExecutionData: executionSteps,
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

// Tracer source files as strings
var tracerHeader = `#pragma once

#include <string>
#include <vector>
#include <map>
#include <memory>
#include <functional>
#include <iostream>
#include <sstream>
#include <typeinfo>
#include <typeindex>
#include <chrono>
#include <stack>
#include <queue>
#include <array>
#include <list>
#include <forward_list>
#include <set>
#include <unordered_set>
#include <deque>

namespace tracer {

// Forward declarations
class Traceable;
class Tracer;

// Global tracer instance
extern Tracer* globalTracer;

// Helper traits to detect container types
template<typename T>
struct is_map : std::false_type {};

template<typename K, typename V>
struct is_map<std::map<K, V>> : std::true_type {};

template<typename K, typename V>
struct is_map<std::unordered_map<K, V>> : std::true_type {};

template<typename T>
struct is_set : std::false_type {};

template<typename T>
struct is_set<std::set<T>> : std::true_type {};

template<typename T>
struct is_set<std::unordered_set<T>> : std::true_type {};

template<typename T>
struct is_set<std::multiset<T>> : std::true_type {};

template<typename T>
struct is_set<std::unordered_multiset<T>> : std::true_type {};

template<typename T>
struct is_priority_queue : std::false_type {};

template<typename T, typename Container, typename Compare>
struct is_priority_queue<std::priority_queue<T, Container, Compare>> : std::true_type {};

template<typename T>
struct is_deque : std::false_type {};

template<typename T>
struct is_deque<std::deque<T>> : std::true_type {};

template<typename T>
struct is_vector : std::false_type {};

template<typename T>
struct is_vector<std::vector<T>> : std::true_type {};

template<typename T>
struct is_stack : std::false_type {};

template<typename T, typename Container>
struct is_stack<std::stack<T, Container>> : std::true_type {};

template<typename T>
struct is_queue : std::false_type {};

template<typename T, typename Container>
struct is_queue<std::queue<T, Container>> : std::true_type {};

template<typename T>
struct is_array : std::false_type {};

template<typename T, std::size_t N>
struct is_array<std::array<T, N>> : std::true_type {};

template<typename T>
struct is_list : std::false_type {};

template<typename T>
struct is_list<std::list<T>> : std::true_type {};

template<typename T>
struct is_forward_list : std::false_type {};

template<typename T>
struct is_forward_list<std::forward_list<T>> : std::true_type {};

// Helper function to convert any numeric type to string
template<typename T>
std::string toString(const T& value) {
    if constexpr (std::is_same_v<T, std::string>) {
        return "\"" + value + "\"";
    } else if constexpr (std::is_arithmetic_v<T>) {
        return std::to_string(value);
    } else if constexpr (std::is_same_v<T, std::pair<const typename T::first_type, typename T::second_type>>) {
        return "{\"key\":" + toString(value.first) + ",\"value\":" + toString(value.second) + "}";
    } else {
        return std::string(value);
    }
}

// Helper function to serialize a pair
template<typename T1, typename T2>
std::string serializePair(const std::pair<T1, T2>& p) {
    return "{\"key\":" + toString(p.first) + 
           ",\"value\":" + toString(p.second) + "}";
}

// Base class for all traceable objects
class Traceable {
public:
    virtual ~Traceable() = default;
    virtual std::string getType() const = 0;
    virtual std::string getName() const = 0;
    virtual std::string getState() const = 0;
    virtual std::string getMetadata() const = 0;
    virtual void traceOperation(const std::string& operation, const std::string& description) = 0;
};

// Main tracer class
class Tracer {
public:
    static Tracer& getInstance() {
        static Tracer instance;
        return instance;
    }

    void registerObject(Traceable* obj) {
        objects[obj->getName()] = obj;
    }

    void unregisterObject(Traceable* obj) {
        objects.erase(obj->getName());
    }

    void traceOperation(const std::string& name, const std::string& operation, 
                       const std::string& description) {
        auto it = objects.find(name);
        if (it != objects.end()) {
            it->second->traceOperation(operation, description);
        }
    }

    void snapshot() {
        auto timestamp = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now().time_since_epoch()
        ).count();

        for (const auto& [name, obj] : objects) {
            std::cout << "STATE:{\"type\":\"" << obj->getType() << "\","
                     << "\"name\":\"" << obj->getName() << "\","
                     << "\"state\":" << obj->getState() << ","
                     << "\"metadata\":" << obj->getMetadata() << ","
                     << "\"operation\":\"snapshot\","
                     << "\"description\":\"Program state snapshot\","
                     << "\"timestamp\":" << timestamp << "}" << std::endl;
        }
    }

private:
    std::map<std::string, Traceable*> objects;
};

// Template for tracing containers
template<typename Container>
class ContainerTracer : public Traceable {
public:
    ContainerTracer(const std::string& name, Container& container)
        : name(name), container(container) {
        globalTracer->registerObject(this);
    }

    ~ContainerTracer() {
        globalTracer->unregisterObject(this);
    }

    std::string getType() const override {
        if constexpr (is_map<Container>::value) {
            return "map";
        } else if constexpr (is_vector<Container>::value) {
            return "vector";
        } else if constexpr (is_stack<Container>::value) {
            return "stack";
        } else if constexpr (is_queue<Container>::value) {
            return "queue";
        } else if constexpr (is_priority_queue<Container>::value) {
            return "priority_queue";
        } else if constexpr (is_deque<Container>::value) {
            return "deque";
        } else if constexpr (is_array<Container>::value) {
            return "array";
        } else if constexpr (is_list<Container>::value) {
            return "list";
        } else if constexpr (is_forward_list<Container>::value) {
            return "forward_list";
        } else if constexpr (is_set<Container>::value) {
            if constexpr (std::is_same_v<Container, std::set<typename Container::value_type>>) {
                return "set";
            } else if constexpr (std::is_same_v<Container, std::unordered_set<typename Container::value_type>>) {
                return "unordered_set";
            } else if constexpr (std::is_same_v<Container, std::multiset<typename Container::value_type>>) {
                return "multiset";
            } else {
                return "unordered_multiset";
            }
        } else {
            return "container";
        }
    }

    std::string getName() const override {
        return name;
    }

    std::string getState() const override {
        std::string result = "[";
        bool first = true;

        if constexpr (is_stack<Container>::value) {
            // Create a copy of the stack to iterate
            Container temp = container;
            while (!temp.empty()) {
                if (!first) result += ",";
                result += toString(temp.top());
                temp.pop();
                first = false;
            }
        } else if constexpr (is_queue<Container>::value) {
            // Create a copy of the queue to iterate
            Container temp = container;
            while (!temp.empty()) {
                if (!first) result += ",";
                result += toString(temp.front());
                temp.pop();
                first = false;
            }
        } else if constexpr (is_priority_queue<Container>::value) {
            // Create a copy of the priority queue to iterate
            Container temp = container;
            while (!temp.empty()) {
                if (!first) result += ",";
                result += toString(temp.top());
                temp.pop();
                first = false;
            }
        } else if constexpr (is_deque<Container>::value) {
            for (const auto& item : container) {
                if (!first) result += ",";
                result += toString(item);
                first = false;
            }
        } else if constexpr (is_array<Container>::value) {
            for (const auto& item : container) {
                if (!first) result += ",";
                result += toString(item);
                first = false;
            }
        } else {
            for (const auto& item : container) {
                if (!first) result += ",";
                if constexpr (is_map<Container>::value) {
                    result += serializePair(item);
                } else {
                    result += toString(item);
                }
                first = false;
            }
        }
        result += "]";
        return result;
    }

    std::string getMetadata() const override {
        std::string result = "{";
        if constexpr (is_map<Container>::value) {
            using KeyType = typename Container::key_type;
            using ValueType = typename Container::mapped_type;
            result += "\"size\":" + std::to_string(container.size()) + "," +
                     "\"empty\":" + (container.empty() ? "true" : "false") + "," +
                     "\"key_type\":\"" + typeid(KeyType).name() + "\"," +
                     "\"value_type\":\"" + typeid(ValueType).name() + "\"";
        } else if constexpr (is_vector<Container>::value) {
            result += "\"size\":" + std::to_string(container.size()) + "," +
                     "\"capacity\":" + std::to_string(container.capacity()) + "," +
                     "\"empty\":" + (container.empty() ? "true" : "false") + "," +
                     "\"element_type\":\"" + typeid(typename Container::value_type).name() + "\"";
        } else if constexpr (is_array<Container>::value) {
            result += "\"size\":" + std::to_string(container.size()) + "," +
                     "\"max_size\":" + std::to_string(container.max_size()) + "," +
                     "\"empty\":" + (container.empty() ? "true" : "false") + "," +
                     "\"element_type\":\"" + typeid(typename Container::value_type).name() + "\"";
        } else if constexpr (is_stack<Container>::value || is_queue<Container>::value || 
                           is_priority_queue<Container>::value) {
            result += "\"size\":" + std::to_string(container.size()) + "," +
                     "\"empty\":" + (container.empty() ? "true" : "false") + "," +
                     "\"element_type\":\"" + typeid(typename Container::value_type).name() + "\"";
        } else if constexpr (is_deque<Container>::value) {
            result += "\"size\":" + std::to_string(container.size()) + "," +
                     "\"empty\":" + (container.empty() ? "true" : "false") + "," +
                     "\"element_type\":\"" + typeid(typename Container::value_type).name() + "\"";
        } else if constexpr (is_forward_list<Container>::value) {
            // Calculate size manually for forward_list
            size_t count = 0;
            for (auto it = container.begin(); it != container.end(); ++it) {
                ++count;
            }
            result += "\"size\":" + std::to_string(count) + "," +
                     "\"empty\":" + (container.empty() ? "true" : "false") + "," +
                     "\"element_type\":\"" + typeid(typename Container::value_type).name() + "\"";
        } else if constexpr (is_list<Container>::value) {
            result += "\"size\":" + std::to_string(container.size()) + "," +
                     "\"empty\":" + (container.empty() ? "true" : "false") + "," +
                     "\"element_type\":\"" + typeid(typename Container::value_type).name() + "\"";
        } else if constexpr (is_set<Container>::value) {
            result += "\"size\":" + std::to_string(container.size()) + "," +
                     "\"empty\":" + (container.empty() ? "true" : "false") + "," +
                     "\"element_type\":\"" + typeid(typename Container::value_type).name() + "\"";
        } else {
            result += "\"size\":" + std::to_string(container.size()) + "," +
                     "\"empty\":" + (container.empty() ? "true" : "false") + "," +
                     "\"element_type\":\"" + typeid(typename Container::value_type).name() + "\"";
        }
        result += "}";
        return result;
    }

    void traceOperation(const std::string& operation, const std::string& description) override {
        auto timestamp = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now().time_since_epoch()
        ).count();

        std::cout << "STATE:{\"type\":\"" << getType() << "\","
                 << "\"name\":\"" << getName() << "\","
                 << "\"state\":" << getState() << ","
                 << "\"metadata\":" << getMetadata() << ","
                 << "\"operation\":\"" << operation << "\","
                 << "\"description\":\"" << description << "\","
                 << "\"timestamp\":" << timestamp << "}" << std::endl;
    }

private:
    std::string name;
    Container& container;
};

// Helper function to create a traced container
template<typename Container>
ContainerTracer<Container> makeTracedContainer(const std::string& name, Container& container) {
    return ContainerTracer<Container>(name, container);
}

} // namespace tracer`

var tracerImpl = `#include "tracer.h"

namespace tracer {
    Tracer* globalTracer = &Tracer::getInstance();
}`
