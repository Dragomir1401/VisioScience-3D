package prettifier

import (
	"strconv"
	"strings"

	"feed-data-service/models"
)

func ParseMolFile(molFile string) (models.MolParsedData, error) {
	var molObj models.MolParsedData

	lines := strings.Split(molFile, "\n")

	var cleanLines []string
	for _, l := range lines {
		if strings.TrimSpace(l) != "" {
			cleanLines = append(cleanLines, l)
		}
	}
	lines = cleanLines

	//----------------------------------------------------------------
	// HEADER
	//----------------------------------------------------------------
	if len(lines) >= 1 {
		molObj.Header.Title = lines[0]
	}

	if len(lines) >= 2 {
		line1Parts := strings.SplitN(lines[1], "  ", 3)
		if len(line1Parts) > 1 {
			molObj.Header.Program = strings.TrimSpace(line1Parts[1])
		}
		if len(line1Parts) > 2 {
			molObj.Header.TimeStamp = strings.TrimSpace(line1Parts[2])
		}
	}

	if len(lines) >= 3 {
		molObj.Header.Comment = lines[2]
	}

	var molCounts models.MolCounts

	if len(lines) >= 4 && len(strings.TrimSpace(lines[3])) > 0 {
		countLine := lines[3]
		var countChunks []string
		for i := 0; i < len(countLine); i += 3 {
			chunk := countLine[i:min(i+3, len(countLine))]
			countChunks = append(countChunks, chunk)
			if len(countChunks) >= 6 {
				break
			}
		}

		if len(countChunks) > 0 {
			molCounts.Molecules, _ = strconv.Atoi(strings.TrimSpace(countChunks[0]))
		}
		if len(countChunks) > 1 {
			molCounts.Bonds, _ = strconv.Atoi(strings.TrimSpace(countChunks[1]))
		}
		if len(countChunks) > 2 {
			molCounts.Lists, _ = strconv.Atoi(strings.TrimSpace(countChunks[2]))
		}
		if len(countChunks) > 4 {
			cVal := strings.TrimSpace(countChunks[4])
			molCounts.Chiral = (cVal == "1")
		}
		if len(countChunks) > 5 {
			molCounts.Stext = strings.TrimSpace(countChunks[5])
		}
	}

	molObj.Counts = molCounts

	//----------------------------------------------------------------
	// ATOMS
	//----------------------------------------------------------------
	numAtoms := molObj.Counts.Molecules
	startAtoms := 4
	endAtoms := startAtoms + numAtoms

	var atoms []models.Atom
	if startAtoms < len(lines) {
		for idx := startAtoms; idx < endAtoms && idx < len(lines); idx++ {
			line := lines[idx]
			if len(strings.TrimSpace(line)) == 0 {
				continue
			}

			xStr := safeSlice(line, 0, 10)
			yStr := safeSlice(line, 10, 20)
			zStr := safeSlice(line, 20, 30)
			typ := safeSlice(line, 31, 34)

			xVal, _ := strconv.ParseFloat(strings.TrimSpace(xStr), 64)
			yVal, _ := strconv.ParseFloat(strings.TrimSpace(yStr), 64)
			zVal, _ := strconv.ParseFloat(strings.TrimSpace(zStr), 64)
			atType := strings.TrimSpace(typ)

			at := models.Atom{
				X:    xVal,
				Y:    yVal,
				Z:    zVal,
				Type: atType,
			}
			atoms = append(atoms, at)
		}
	}

	molObj.Atoms = atoms

	//----------------------------------------------------------------
	// BONDS
	//----------------------------------------------------------------
	numBonds := molObj.Counts.Bonds
	startBonds := endAtoms
	endBonds := startBonds + numBonds

	var bonds []models.Bond
	if startBonds < len(lines) {
		for idx := startBonds; idx < endBonds && idx < len(lines); idx++ {
			line := lines[idx]
			if len(strings.TrimSpace(line)) == 0 {
				continue
			}
			a1Str := strings.TrimSpace(safeSlice(line, 0, 3))
			a2Str := strings.TrimSpace(safeSlice(line, 3, 6))
			btStr := strings.TrimSpace(safeSlice(line, 6, 9))

			a1, _ := strconv.Atoi(a1Str)
			a2, _ := strconv.Atoi(a2Str)
			bType, _ := strconv.Atoi(btStr)

			bond := models.Bond{
				Atom1:    a1 - 1,
				Atom2:    a2 - 1,
				BondType: bType,
			}
			bonds = append(bonds, bond)
		}
	}
	molObj.Bonds = bonds

	return molObj, nil
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func safeSlice(line string, start, end int) string {
	if start >= len(line) {
		return ""
	}
	if end > len(line) {
		end = len(line)
	}
	return line[start:end]
}
