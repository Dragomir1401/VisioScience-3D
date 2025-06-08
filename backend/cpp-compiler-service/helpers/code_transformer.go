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
#include "tracer.h"

using namespace tracer;

`

	// Process the code line by line
	lines := strings.Split(code, "\n")
	var tracers []string // Keep track of all tracers we create

	for i, line := range lines {
		// Transform map declarations
		if strings.Contains(line, "map<") {
			re := regexp.MustCompile(`(?:std::)?map<(?:std::)?\w+,\s*(?:std::)?\w+>\s+(\w+)(?:\s*(?:=|{|;))?`)
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

		// Transform map operations
		if strings.Contains(line, "[") && strings.Contains(line, "]=") {
			// Handle map[key] = value operations
			re := regexp.MustCompile(`(\w+)\[([^]]+)\]\s*=`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 3 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"insert\", \"Inserted value\");",
					tracerVar)
			}
		}

		// Handle map erase
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

		// Transform vector operations
		if strings.Contains(line, ".push_back(") {
			re := regexp.MustCompile(`(\w+)\.push_back\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"insert\", \"Inserted element\");",
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
