package prettifier

import (
	"fmt"
	"strconv"
	"strings"

	"feed-data-service/models"
)

func ParseMolFile(molFile string) (models.MolParsedData, error) {
	var molObj models.MolParsedData

	molFile = strings.ReplaceAll(molFile, "\r", "")
	lines := strings.Split(molFile, "\n")

	if len(lines) < 4 {
		return molObj, fmt.Errorf("mol file too short: %d lines", len(lines))
	}

	molObj.Header.Title = lines[0]
	parts := strings.Fields(lines[1])
	if len(parts) >= 2 {
		molObj.Header.Program = parts[1]
	}
	if len(parts) >= 3 {
		molObj.Header.TimeStamp = parts[2]
	}
	molObj.Header.Comment = lines[2]

	cnt := padRight(lines[3], 27)
	atomCount, _ := strconv.Atoi(strings.TrimSpace(cnt[0:3]))
	bondCount, _ := strconv.Atoi(strings.TrimSpace(cnt[3:6]))
	listCount, _ := strconv.Atoi(strings.TrimSpace(cnt[6:9]))
	chiralFlag := strings.TrimSpace(cnt[12:15]) == "1"
	stext := strings.TrimSpace(cnt[15:27])

	molObj.Counts = models.MolCounts{
		Atoms:  atomCount,
		Bonds:  bondCount,
		Lists:  listCount,
		Chiral: chiralFlag,
		Stext:  stext,
	}

	startAtoms := 4
	endAtoms := startAtoms + atomCount
	var atoms []models.Atom
	for i := startAtoms; i < endAtoms && i < len(lines); i++ {
		line := lines[i]
		if strings.TrimSpace(line) == "" {
			continue
		}
		xStr := safeSlice(line, 0, 10)
		yStr := safeSlice(line, 10, 20)
		zStr := safeSlice(line, 20, 30)
		typeStr := safeSlice(line, 31, 34)

		xVal, _ := strconv.ParseFloat(strings.TrimSpace(xStr), 64)
		yVal, _ := strconv.ParseFloat(strings.TrimSpace(yStr), 64)
		zVal, _ := strconv.ParseFloat(strings.TrimSpace(zStr), 64)
		atomType := strings.TrimSpace(typeStr)

		atoms = append(atoms, models.Atom{
			X:    xVal,
			Y:    yVal,
			Z:    zVal,
			Type: atomType,
		})
	}
	molObj.Atoms = atoms

	startBonds := endAtoms
	endBonds := startBonds + bondCount
	var bonds []models.Bond
	for i := startBonds; i < endBonds && i < len(lines); i++ {
		line := lines[i]
		if strings.TrimSpace(line) == "" {
			continue
		}
		a1Str := strings.TrimSpace(safeSlice(line, 0, 3))
		a2Str := strings.TrimSpace(safeSlice(line, 3, 6))
		btStr := strings.TrimSpace(safeSlice(line, 6, 9))

		a1, _ := strconv.Atoi(a1Str)
		a2, _ := strconv.Atoi(a2Str)
		bType, _ := strconv.Atoi(btStr)

		bonds = append(bonds, models.Bond{
			Atom1:    a1 - 1,
			Atom2:    a2 - 1,
			BondType: bType,
		})
	}
	molObj.Bonds = bonds

	return molObj, nil
}

func padRight(s string, n int) string {
	if len(s) >= n {
		return s[:n]
	}
	return s + strings.Repeat(" ", n-len(s))
}

func safeSlice(s string, start, end int) string {
	if start >= len(s) {
		return ""
	}
	if end > len(s) {
		end = len(s)
	}
	return s[start:end]
}
