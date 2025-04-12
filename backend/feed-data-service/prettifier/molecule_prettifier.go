package prettifier

import (
	"strconv"
	"strings"

	"feed-data-service/models"
)

// ParseMolFile transformă conținutul brut al unui fișier .mol
// într-o structură MolParsedData, cu header, counts, atoms, bonds,
// folosind o abordare "best effort": dacă anumite linii lipsesc,
// parse-ul nu eșuează (decât dacă fișierul e complet gol).
func ParseMolFile(molFile string) (models.MolParsedData, error) {
	var molObj models.MolParsedData

	// Împărțim fișierul pe linii
	lines := strings.Split(molFile, "\n")

	// Filtrăm liniile complet goale (cu spații)
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
	// JS cod:
	//  molObj.header.title     = split[0];
	//  molObj.header.program   = split[1].split('  ')[1];
	//  molObj.header.timeStamp = split[1].split('  ')[2];
	//  molObj.header.comment   = split[2];

	// title = lines[0] (dacă există)
	if len(lines) >= 1 {
		molObj.Header.Title = lines[0]
	}

	// Linia 1 (index = 1 in Go) => program + timestamp (dacă există)
	// Ex: "  Marvin  12300703363D          "
	if len(lines) >= 2 {
		line1Parts := strings.SplitN(lines[1], "  ", 3) // split by 2 spaces
		if len(line1Parts) > 1 {
			molObj.Header.Program = strings.TrimSpace(line1Parts[1])
		}
		if len(line1Parts) > 2 {
			molObj.Header.TimeStamp = strings.TrimSpace(line1Parts[2])
		}
	}

	// Linia 2 (index = 2) => comment
	if len(lines) >= 3 {
		molObj.Header.Comment = lines[2]
	}

	//----------------------------------------------------------------
	// COUNTS (linia 3 = index 3), ex: " 24 25  0  0  0  0            999 V2000"
	//----------------------------------------------------------------
	// În JS se făcea chunk de 3 caractere. Aici facem la fel, în limita a 6 blocuri.
	var molCounts models.MolCounts

	if len(lines) >= 4 && len(strings.TrimSpace(lines[3])) > 0 {
		countLine := lines[3]
		// Spargem la fiecare 3 caractere, până la max 6 blocuri
		var countChunks []string
		for i := 0; i < len(countLine); i += 3 {
			chunk := countLine[i:min(i+3, len(countLine))]
			countChunks = append(countChunks, chunk)
			if len(countChunks) >= 6 {
				break
			}
		}

		// interpretăm (best effort)
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
	// Indicele de start al atomilor = 4 (linia a 5-a), similar cu JS
	startAtoms := 4
	endAtoms := startAtoms + numAtoms

	var atoms []models.Atom
	// Iterăm numai până la endAtoms, dar și să nu depășim len(lines)
	if startAtoms < len(lines) {
		for idx := startAtoms; idx < endAtoms && idx < len(lines); idx++ {
			line := lines[idx]
			if len(strings.TrimSpace(line)) == 0 {
				continue // linie goală
			}
			// În JS: x=0..10, y=10..20, z=20..30, type=31..33
			// Verificăm dacă linia are lungimea necesară
			// dar, "best effort": dacă e prea scurtă, încercăm să parsez ce pot.
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
			// ex: "  1  9  2  0  0  0  0"
			//  => atom1 = [0..3], atom2 = [3..6], bondType = [6..9]
			a1Str := strings.TrimSpace(safeSlice(line, 0, 3))
			a2Str := strings.TrimSpace(safeSlice(line, 3, 6))
			btStr := strings.TrimSpace(safeSlice(line, 6, 9))

			a1, _ := strconv.Atoi(a1Str)
			a2, _ := strconv.Atoi(a2Str)
			bType, _ := strconv.Atoi(btStr)

			// În formatul .mol, atomii sunt 1-based
			// Dar noi, dacă deja i-am salvat 0-based, putem scădea 1 direct
			// Sau îi lăsăm 1-based și ajustăm în front-end.
			// Aici scad direct 1 (dar ai grijă la front-end).
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

// min helper
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// safeSlice - returnează substringul dintre start și end,
// dar nu iese din lungimea liniei.
func safeSlice(line string, start, end int) string {
	if start >= len(line) {
		return ""
	}
	if end > len(line) {
		end = len(line)
	}
	return line[start:end]
}
