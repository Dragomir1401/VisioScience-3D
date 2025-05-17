package utils

import (
	"regexp"
	"strings"
)

// NormalizePath replaces IDs in URLs with {id} to avoid high cardinality metrics
func NormalizePath(path string) string {
	// Remove query parameters
	path = strings.Split(path, "?")[0]

	// Replace MongoDB ObjectIDs with {id}
	objectIDPattern := regexp.MustCompile(`[0-9a-f]{24}`)
	path = objectIDPattern.ReplaceAllString(path, "{id}")

	// Replace any remaining numeric IDs with {id}
	numericIDPattern := regexp.MustCompile(`/\d+`)
	path = numericIDPattern.ReplaceAllString(path, "/{id}")

	return path
}
