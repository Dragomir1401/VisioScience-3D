package utils

import (
	"regexp"
	"strings"
)

func NormalizePath(path string) string {
	path = strings.Split(path, "?")[0]

	objectIDPattern := regexp.MustCompile(`[0-9a-f]{24}`)
	path = objectIDPattern.ReplaceAllString(path, "{id}")

	numericIDPattern := regexp.MustCompile(`/\d+`)
	path = numericIDPattern.ReplaceAllString(path, "/{id}")

	return path
}
