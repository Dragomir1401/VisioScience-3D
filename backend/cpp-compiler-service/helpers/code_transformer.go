package helpers

import (
	"fmt"
	"regexp"
	"strings"
)

func TransformCode(code string) string {
	transformedCode := `#include <iostream>
#include <vector>
#include <string>
#include <map>
#include <unordered_map>
#include <stack>
#include <queue>
#include <array>
#include <list>
#include <forward_list>
#include <set>
#include <unordered_set>
#include "tracer.h"

using namespace tracer;

`
	lines := strings.Split(code, "\n")
	var tracers []string
	inIOOperation := false
	inDumpFunction := false

	for i, line := range lines {
		trimmedLine := strings.TrimSpace(line)
		if strings.HasPrefix(trimmedLine, "//") {
			lines[i] = line
			continue
		}

		if strings.Contains(line, "void dump") {
			inDumpFunction = true
		}

		if inDumpFunction && strings.Contains(line, "}") {
			inDumpFunction = false
		}

		if inDumpFunction {
			lines[i] = line
			continue
		}

		if strings.Contains(line, "std::cout") || strings.Contains(line, "std::cin") {
			inIOOperation = true
		}

		if inIOOperation && strings.Contains(line, ";") {
			inIOOperation = false
		}

		if inIOOperation {
			lines[i] = line
			continue
		}

		if strings.Contains(line, "template<") && strings.Contains(line, "void dump") {
			paramRegex := regexp.MustCompile(`\([^,]+,\s*const\s+(\w+)&\)`)
			if matches := paramRegex.FindStringSubmatch(line); len(matches) > 1 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("auto %s = makeTracedContainer(\"%s\", const_cast<%s&>(%s));",
					tracerVar, varName, varName, varName)
				tracers = append(tracers, tracerVar)
			}
			continue
		}

		if strings.Contains(line, "void dumpPQ") {
			paramRegex := regexp.MustCompile(`\([^,]+,\s*(\w+)\)`)
			if matches := paramRegex.FindStringSubmatch(line); len(matches) > 1 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("auto %s = makeTracedContainer(\"%s\", %s);",
					tracerVar, varName, varName)
				tracers = append(tracers, tracerVar)
			}
			continue
		}

		if strings.Contains(line, "set<") || strings.Contains(line, "unordered_set<") ||
			strings.Contains(line, "multiset<") || strings.Contains(line, "unordered_multiset<") {
			re := regexp.MustCompile(`(?:std::)?(?:unordered_)?(?:multi)?set<(?:std::)?\w+>\s+(\w+)(?:\s*(?:=|{|;))?`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				tracers = append(tracers, tracerVar)
				lines[i] = line + "\n" + fmt.Sprintf("auto %s = makeTracedContainer(\"%s\", %s);",
					tracerVar, varName, varName)
			}
		}

		if strings.Contains(line, "array<") && !strings.Contains(line, "const") && !strings.Contains(line, "&") {
			re := regexp.MustCompile(`(?:std::)?array<(?:std::)?\w+,\s*\d+>\s+(\w+)(?:\s*(?:=|{|;))?`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				tracers = append(tracers, tracerVar)
				lines[i] = line + "\n" + fmt.Sprintf("auto %s = makeTracedContainer(\"%s\", %s);",
					tracerVar, varName, varName)
			}
		}

		if strings.Contains(line, "[") && !strings.Contains(line, "[]=") {
			re := regexp.MustCompile(`(\w+)\[([^]]+)\]`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 3 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"access\", \"Accessed element at index\");",
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

		if strings.Contains(line, ".size()") {
			re := regexp.MustCompile(`(\w+)\.size\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"size\", \"Accessed size\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".empty()") {
			re := regexp.MustCompile(`(\w+)\.empty\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"empty\", \"Checked if empty\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".fill(") {
			re := regexp.MustCompile(`(\w+)\.fill\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"fill\", \"Filled array with value\");",
					tracerVar)
			}
		}

		if strings.Contains(line, "std::swap(") {
			re := regexp.MustCompile(`std::swap\((\w+)\[`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"swap\", \"Swapped array elements\");",
					tracerVar)
			}
		}

		if strings.Contains(line, "std::sort(") {
			re := regexp.MustCompile(`std::sort\((\w+)\.begin\(\)`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"sort\", \"Sorted array elements\");",
					tracerVar)
			}
		}

		if strings.Contains(line, "std::rotate(") {
			re := regexp.MustCompile(`std::rotate\((\w+)\.begin\(\)`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"rotate\", \"Rotated array elements\");",
					tracerVar)
			}
		}

		if strings.Contains(line, "std::iota(") {
			re := regexp.MustCompile(`std::iota\((\w+)\.begin\(\)`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"iota\", \"Filled array with sequential values\");",
					tracerVar)
			}
		}

		if strings.Contains(line, "list<") && !strings.Contains(line, "const") && !strings.Contains(line, "&") {
			re := regexp.MustCompile(`(?:std::)?list<(?:std::)?\w+>\s+(\w+)(?:\s*(?:=|{|;))?`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				tracers = append(tracers, tracerVar)
				lines[i] = line + "\n" + fmt.Sprintf("auto %s = makeTracedContainer(\"%s\", %s);",
					tracerVar, varName, varName)
			}
		}

		if strings.Contains(line, "forward_list<") && !strings.Contains(line, "const") && !strings.Contains(line, "&") {
			re := regexp.MustCompile(`(?:std::)?forward_list<(?:std::)?\w+>\s+(\w+)(?:\s*(?:=|{|;))?`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				tracers = append(tracers, tracerVar)
				lines[i] = line + "\n" + fmt.Sprintf("auto %s = makeTracedContainer(\"%s\", %s);",
					tracerVar, varName, varName)
			}
		}

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

		if strings.Contains(line, "priority_queue<") {
			re := regexp.MustCompile(`(?:std::)?priority_queue<(?:std::)?\w+(?:,\s*(?:std::)?vector<(?:std::)?\w+>)?(?:,\s*(?:std::)?(?:greater|less)<(?:std::)?\w+>)?>\s+(\w+)(?:\s*(?:=|{|;))?`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				tracers = append(tracers, tracerVar)
				lines[i] = line + "\n" + fmt.Sprintf("auto %s = makeTracedContainer(\"%s\", %s);",
					tracerVar, varName, varName)
			}
		}

		if strings.Contains(line, "deque<") {
			re := regexp.MustCompile(`(?:std::)?deque<(?:std::)?\w+>\s+(\w+)(?:\s*(?:=|{|;))?`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				tracers = append(tracers, tracerVar)
				lines[i] = line + "\n" + fmt.Sprintf("auto %s = makeTracedContainer(\"%s\", %s);",
					tracerVar, varName, varName)
			}
		}

		if strings.Contains(line, "[") && strings.Contains(line, "]=") {
			re := regexp.MustCompile(`(\w+)\[([^]]+)\]\s*=`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 3 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"insert\", \"Inserted/Updated value\");",
					tracerVar)
			}
		}

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

		if strings.Contains(line, ".push(") {
			re := regexp.MustCompile(`(\w+)\.push\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"insert\", \"Pushed element\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".pop()") {
			re := regexp.MustCompile(`(\w+)\.pop\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"delete\", \"Popped element\");",
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

		if strings.Contains(line, ".push_front(") {
			re := regexp.MustCompile(`(\w+)\.push_front\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"insert\", \"Inserted element at front\");",
					tracerVar)
			}
		}

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

		if strings.Contains(line, ".pop_front()") {
			re := regexp.MustCompile(`(\w+)\.pop_front\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"delete\", \"Deleted front element\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".pop_back()") {
			re := regexp.MustCompile(`(\w+)\.pop_back\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"delete\", \"Deleted back element\");",
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

		if strings.Contains(line, ".at(") {
			re := regexp.MustCompile(`(\w+)\.at\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"access\", \"Accessed element at position\");",
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

		if strings.Contains(line, ".shrink_to_fit()") {
			re := regexp.MustCompile(`(\w+)\.shrink_to_fit\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"shrink\", \"Shrunk container capacity\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".push_front(") {
			re := regexp.MustCompile(`(\w+)\.push_front\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"insert\", \"Inserted element at front\");",
					tracerVar)
			}
		}

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

		if strings.Contains(line, ".pop_front()") {
			re := regexp.MustCompile(`(\w+)\.pop_front\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"delete\", \"Deleted front element\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".pop_back()") {
			re := regexp.MustCompile(`(\w+)\.pop_back\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"delete\", \"Deleted back element\");",
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

		if strings.Contains(line, ".remove(") {
			re := regexp.MustCompile(`(\w+)\.remove\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"delete\", \"Removed elements with value\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".remove_if(") {
			re := regexp.MustCompile(`(\w+)\.remove_if\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"delete\", \"Removed elements matching condition\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".sort()") {
			re := regexp.MustCompile(`(\w+)\.sort\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"sort\", \"Sorted container\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".reverse()") {
			re := regexp.MustCompile(`(\w+)\.reverse\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"reverse\", \"Reversed container\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".merge(") {
			re := regexp.MustCompile(`(\w+)\.merge\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"merge\", \"Merged with another container\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".splice(") {
			re := regexp.MustCompile(`(\w+)\.splice\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"splice\", \"Moved elements from another container\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".unique()") {
			re := regexp.MustCompile(`(\w+)\.unique\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"unique\", \"Removed consecutive duplicates\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".insert_after(") {
			re := regexp.MustCompile(`(\w+)\.insert_after\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"insert\", \"Inserted element after position\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".erase_after(") {
			re := regexp.MustCompile(`(\w+)\.erase_after\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"delete\", \"Deleted element after position\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".splice_after(") {
			re := regexp.MustCompile(`(\w+)\.splice_after\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"splice\", \"Moved elements after position\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".push_front(") {
			re := regexp.MustCompile(`(\w+)\.push_front\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"insert\", \"Inserted element at front\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".remove(") {
			re := regexp.MustCompile(`(\w+)\.remove\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"delete\", \"Removed elements with value\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".remove_if(") {
			re := regexp.MustCompile(`(\w+)\.remove_if\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"delete\", \"Removed elements matching condition\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".sort()") {
			re := regexp.MustCompile(`(\w+)\.sort\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"sort\", \"Sorted container\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".reverse()") {
			re := regexp.MustCompile(`(\w+)\.reverse\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"reverse\", \"Reversed container\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".merge(") {
			re := regexp.MustCompile(`(\w+)\.merge\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"merge\", \"Merged with another container\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".splice(") {
			re := regexp.MustCompile(`(\w+)\.splice\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"splice\", \"Moved elements from another container\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".unique()") {
			re := regexp.MustCompile(`(\w+)\.unique\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"unique\", \"Removed consecutive duplicates\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".insert(") {
			re := regexp.MustCompile(`(\w+)\.insert\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"insert\", \"Inserted element\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".erase(") {
			re := regexp.MustCompile(`(\w+)\.erase\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"delete\", \"Deleted element\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".find(") {
			re := regexp.MustCompile(`(\w+)\.find\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"find\", \"Searched for element\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".count(") {
			re := regexp.MustCompile(`(\w+)\.count\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"count\", \"Counted occurrences of element\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".lower_bound(") {
			re := regexp.MustCompile(`(\w+)\.lower_bound\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"lower_bound\", \"Found lower bound\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".upper_bound(") {
			re := regexp.MustCompile(`(\w+)\.upper_bound\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"upper_bound\", \"Found upper bound\");",
					tracerVar)
			}
		}

		if strings.Contains(line, ".equal_range(") {
			re := regexp.MustCompile(`(\w+)\.equal_range\(`)
			matches := re.FindStringSubmatch(line)
			if len(matches) >= 2 {
				varName := matches[1]
				tracerVar := fmt.Sprintf("%s_tracer", varName)
				lines[i] = line + "\n" + fmt.Sprintf("%s.traceOperation(\"equal_range\", \"Found equal range\");",
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

		if strings.Contains(line, "if (") || strings.Contains(line, "for (") {
			lines[i] = line + "\n" + "Tracer::getInstance().snapshot();"
		}
	}

	for i, line := range lines {
		if strings.Contains(line, "return") {
			lines[i] = "Tracer::getInstance().snapshot();\n" + line
			break
		}
	}

	transformedCode += strings.Join(lines, "\n")
	return transformedCode
}
