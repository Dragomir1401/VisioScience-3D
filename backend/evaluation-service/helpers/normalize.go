package helpers

import (
	"regexp"
)

var idPattern = regexp.MustCompile(`/[0-9a-fA-F]{24}`)

func NormalizePath(path string) string {
	return idPattern.ReplaceAllString(path, "/{id}")
}
