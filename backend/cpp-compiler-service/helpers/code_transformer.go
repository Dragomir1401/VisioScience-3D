package helpers

import (
	"fmt"
	"regexp"
	"strings"
)

// TransformCode takes the user's code and transforms it to use our tracing system
func TransformCode(code string) string {
	// Add necessary includes and using statements
	transformedCode := `#include <iostream>
#include <vector>
#include <string>
#include <map>
#include <unordered_map>
#include <stack>
#include <queue>
#include "tracer.h"

using namespace tracer;

`

	// Process the code line by line
	lines := strings.Split(code, "\n")
	var tracers []string // Keep track of all tracers we create

	for i, line := range lines {
		// Transform map declarations
		if strings.Contains(line, "map<") || strings.Contains(line, "unordered_map<") {
			re := regexp.MustCompile(`(?:std::)?(?:unordered_)?map<(?:std::)?\w+,\s*(?:std::)?\w+>\s+(\w+)(?:\s*(?:=|{|;))?`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				tracers = append(tracers, tracerVar)
				lines[i] = line + "\n" + fmt.Sprintf("auto %s = makeTracedContainer(\"%s\", %s);",
					tracerVar, varName, varName)
			}
		}

		// Transform vector declarations
		if strings.Contains(line, "vector<") {
			re := regexp.MustCompile(`(?:std::)?vector<(?:std::)?\w+>\s+(\w+)(?:\s*(?:=|{|;))?`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				tracers = append(tracers, tracerVar)
				lines[i] = line + "\n" + fmt.Sprintf("auto %s = makeTracedContainer(\"%s\", %s);",
					tracerVar, varName, varName)
			}
		}

		// Transform stack declarations
		if strings.Contains(line, "stack<") {
			re := regexp.MustCompile(`(?:std::)?stack<(?:std::)?\w+>\s+(\w+)(?:\s*(?:=|{|;))?`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				tracers = append(tracers, tracerVar)
				lines[i] = line + "\n" + fmt.Sprintf("auto %s = makeTracedContainer(\"%s\", %s);",
					tracerVar, varName, varName)
			}
		}

		// Transform queue declarations
		if strings.Contains(line, "queue<") {
			re := regexp.MustCompile(`(?:std::)?queue<(?:std::)?\w+>\s+(\w+)(?:\s*(?:=|{|;))?`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				tracers = append(tracers, tracerVar)
				lines[i] = line + "\n" + fmt.Sprintf("auto %s = makeTracedContainer(\"%s\", %s);",
					tracerVar, varName, varName)
			}
		}

		// Transform map operations
		if strings.Contains(line, "[") && strings.Contains(line, "]=") {
			// Handle map[key] = value operations
			re := regexp.MustCompile(`(\w+)\[([^]]+)\]\s*=`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 3 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"insert\", \"Inserted/Updated value\");",
					tracerVar)
			}
		}

		// Handle map operations
		if strings.Contains(line, ".insert(") {
			re := regexp.MustCompile(`(\w+)\.insert\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"insert\", \"Inserted value\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".erase(") {
			re := regexp.MustCompile(`(\w+)\.erase\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"delete\", \"Deleted value\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".find(") {
			re := regexp.MustCompile(`(\w+)\.find\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"find\", \"Searched for value\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".clear()") {
			re := regexp.MustCompile(`(\w+)\.clear\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"clear\", \"Cleared container\");",
					tracerVar)
			}
		}

		// Transform vector operations
		if strings.Contains(line, ".push_back(") {
			re := regexp.MustCompile(`(\w+)\.push_back\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"insert\", \"Inserted element at back\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".pop_back()") {
			re := regexp.MustCompile(`(\w+)\.pop_back\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"delete\", \"Deleted last element\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".insert(") {
			re := regexp.MustCompile(`(\w+)\.insert\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"insert\", \"Inserted element at position\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".erase(") {
			re := regexp.MustCompile(`(\w+)\.erase\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"delete\", \"Deleted element at position\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".resize(") {
			re := regexp.MustCompile(`(\w+)\.resize\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"resize\", \"Resized container\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".reserve(") {
			re := regexp.MustCompile(`(\w+)\.reserve\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"reserve\", \"Reserved capacity\");",
					tracerVar)
			}
		}

		// Transform stack operations
		if strings.Contains(line, ".push(") {
			re := regexp.MustCompile(`(\w+)\.push\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"insert\", \"Pushed element to stack\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".pop()") {
			re := regexp.MustCompile(`(\w+)\.pop\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"delete\", \"Popped element from stack\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".top()") {
			re := regexp.MustCompile(`(\w+)\.top\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"access\", \"Accessed top element\");",
					tracerVar)
			}
		}

		// Transform queue operations
		if strings.Contains(line, ".push(") {
			re := regexp.MustCompile(`(\w+)\.push\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"insert\", \"Pushed element to queue\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".pop()") {
			re := regexp.MustCompile(`(\w+)\.pop\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"delete\", \"Popped element from queue\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".front()") {
			re := regexp.MustCompile(`(\w+)\.front\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"access\", \"Accessed front element\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".back()") {
			re := regexp.MustCompile(`(\w+)\.back\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"access\", \"Accessed back element\");",
					tracerVar)
			}
		}

		// Add snapshot after each significant operation
		if strings.Contains(line, "if (") || strings.Contains(line, "for (") {
			lines[i] = line + "\n" + "Tracer::getInstance().snapshot();"
		}
	}

	// Add final snapshot before return
	for i, line := range lines {
		if strings.Contains(line, "return") {
			// Add snapshot before return
			lines[i] = "Tracer::getInstance().snapshot();\n" + line
			break
		}
	}

	transformedCode += strings.Join(lines, "\n")
	return transformedCode
}
