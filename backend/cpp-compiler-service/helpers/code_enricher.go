package helpers

import (
	"fmt"
	"regexp"
	"strings"
)

// DataStructurePattern represents a pattern to match and its corresponding state tracking code
type DataStructurePattern struct {
	Pattern        *regexp.Regexp
	Type           string
	StateExtractor string
	Operations     map[string]string
}

var (
	// Common C++ data structure patterns
	patterns = []DataStructurePattern{
		{
			Pattern:        regexp.MustCompile(`std::vector<(\w+)>\s+(\w+)\s*=\s*{([^}]*)}`),
			Type:           "array",
			StateExtractor: "vectorToJson(%s)",
			Operations: map[string]string{
				"push_back": "printState(\"array\", \"%s\", vectorToJson(%s), \"insert\", \"Inserted element \" + std::to_string(%s.back()))",
				"pop_back":  "printState(\"array\", \"%s\", vectorToJson(%s), \"delete\", \"Deleted last element\")",
				"insert":    "printState(\"array\", \"%s\", vectorToJson(%s), \"insert\", \"Inserted element at position \" + std::to_string(pos))",
				"erase":     "printState(\"array\", \"%s\", vectorToJson(%s), \"delete\", \"Deleted element at position \" + std::to_string(pos))",
			},
		},
		{
			Pattern:        regexp.MustCompile(`std::list<(\w+)>\s+(\w+)\s*=\s*{([^}]*)}`),
			Type:           "linked_list",
			StateExtractor: "listToJson(%s)",
			Operations: map[string]string{
				"push_front": "printState(\"linked_list\", \"%s\", listToJson(%s), \"insert_front\", \"Inserted element at beginning\")",
				"push_back":  "printState(\"linked_list\", \"%s\", listToJson(%s), \"insert_back\", \"Inserted element at end\")",
				"pop_front":  "printState(\"linked_list\", \"%s\", listToJson(%s), \"delete_front\", \"Deleted first element\")",
				"pop_back":   "printState(\"linked_list\", \"%s\", listToJson(%s), \"delete_back\", \"Deleted last element\")",
			},
		},
		{
			Pattern:        regexp.MustCompile(`std::set<(\w+)>\s+(\w+)\s*=\s*{([^}]*)}`),
			Type:           "binary_tree",
			StateExtractor: "setToJson(%s)",
			Operations: map[string]string{
				"insert": "printState(\"binary_tree\", \"%s\", setToJson(%s), \"insert\", \"Inserted value \" + std::to_string(value))",
				"erase":  "printState(\"binary_tree\", \"%s\", setToJson(%s), \"delete\", \"Deleted value \" + std::to_string(value))",
			},
		},
	}
)

// EnrichCode takes the user's code and injects state tracking code
func EnrichCode(code string) string {
	// Add helper functions at the beginning
	enrichedCode := `#include <iostream>
#include <vector>
#include <list>
#include <set>
#include <string>
#include <sstream>

// Helper function to print state in the required format
void printState(const std::string& type, const std::string& name, 
                const std::string& state, const std::string& operation,
                const std::string& description) {
    std::cout << "STATE:{\"type\":\"" << type << "\","
              << "\"name\":\"" << name << "\","
              << "\"state\":" << state << ","
              << "\"operation\":\"" << operation << "\","
              << "\"description\":\"" << description << "\"}" << std::endl;
}

// Helper function to convert vector to JSON array string
template<typename T>
std::string vectorToJson(const std::vector<T>& vec) {
    std::stringstream ss;
    ss << "[";
    for (size_t i = 0; i < vec.size(); ++i) {
        if constexpr (std::is_same_v<T, std::string>) {
            ss << "\"" << vec[i] << "\"";
        } else {
            ss << vec[i];
        }
        if (i < vec.size() - 1) {
            ss << ",";
        }
    }
    ss << "]";
    return ss.str();
}

// Helper function to convert list to JSON array string
template<typename T>
std::string listToJson(const std::list<T>& lst) {
    std::stringstream ss;
    ss << "[";
    bool first = true;
    for (const auto& item : lst) {
        if (!first) ss << ",";
        ss << item;
        first = false;
    }
    ss << "]";
    return ss.str();
}

// Helper function to convert set to JSON array string
template<typename T>
std::string setToJson(const std::set<T>& st) {
    std::stringstream ss;
    ss << "[";
    bool first = true;
    for (const auto& item : st) {
        if (!first) ss << ",";
        ss << item;
        first = false;
    }
    ss << "]";
    return ss.str();
}

`

	// Process the code line by line
	lines := strings.Split(code, "\n")
	for i, line := range lines {
		// Check each pattern
		for _, pattern := range patterns {
			if pattern.Pattern.MatchString(line) {
				matches := pattern.Pattern.FindStringSubmatch(line)
				if len(matches) >= 3 {
					varName := matches[2]
					// Add initial state print
					stateExtractor := fmt.Sprintf(pattern.StateExtractor, varName)
					initState := fmt.Sprintf("printState(\"%s\", \"%s\", %s, \"init\", \"Initial %s state\");",
						pattern.Type, varName, stateExtractor, pattern.Type)
					lines[i] = line + "\n" + initState
				}
			}

			// Look for operations
			for op, template := range pattern.Operations {
				opPattern := regexp.MustCompile(fmt.Sprintf(`%s\.%s`, `\w+`, op))
				if opPattern.MatchString(line) {
					matches := opPattern.FindStringSubmatch(line)
					if len(matches) >= 1 {
						varName := matches[0][:strings.Index(matches[0], ".")]
						stateExtractor := fmt.Sprintf(pattern.StateExtractor, varName)
						statePrint := fmt.Sprintf(template, varName, stateExtractor, varName)
						lines[i] = line + "\n" + statePrint
					}
				}
			}
		}

		// Add state tracking for search operations
		if strings.Contains(line, "if (num == searchValue)") {
			// Find the variable name from the for loop above
			for j := i - 1; j >= 0; j-- {
				if strings.Contains(lines[j], "for (int num :") {
					varName := strings.TrimSpace(strings.Split(strings.Split(lines[j], "for (int num :")[1], ")")[0])
					statePrint := fmt.Sprintf("printState(\"array\", \"%s\", vectorToJson(%s), \"search\", \"Searching for value \" + std::to_string(searchValue) + (found ? \" - Found\" : \" - Not found\"));",
						varName, varName)
					lines[i] = line + "\n" + statePrint
					break
				}
			}
		}
	}

	enrichedCode += strings.Join(lines, "\n")
	return enrichedCode
}
