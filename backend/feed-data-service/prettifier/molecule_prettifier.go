package prettifier

import (
	"fmt"
	"strconv"
	"strings"

	"feed-data-service/models"
)

// ParseMolFile transformă conținutul brut al unui fișier .mol
// într-o structură MolParsedData, cu header, counts, atoms, bonds.
func ParseMolFile(molFile string) (models.MolParsedData, error) {
	var molObj models.MolParsedData

	// 1) împărțim fișierul pe linii
	lines := strings.Split(molFile, "\n")
	if len(lines) < 5 {
		return molObj, fmt.Errorf("invalid .mol: too few lines")
	}

	//----------------------------------------------------------------
	// PARSE HEADER
	//----------------------------------------------------------------
	// JS cod:
	// molObj.header.title = split[0];
	// molObj.header.program = split[1].split('  ')[1];
	// molObj.header.timeStamp = split[1].split('  ')[2];
	// molObj.header.comment = split[2];

	molObj.Header.Title = lines[0]

	// Linia 1 poate conține ceva gen "  Marvin  12300703363D          "
	// Splitting by double spaces e tricky, faci un strings.SplitN cu "  " si vezi ce iese
	line1Parts := strings.SplitN(lines[1], "  ", 3)
	if len(line1Parts) > 1 {
		molObj.Header.Program = strings.TrimSpace(line1Parts[1])
	}
	if len(line1Parts) > 2 {
		molObj.Header.TimeStamp = strings.TrimSpace(line1Parts[2])
	}

	molObj.Header.Comment = lines[2]

	//----------------------------------------------------------------
	// PARSE COUNTS (linia 3)
	//----------------------------------------------------------------
	// In JS, faceam un chunk de 3 caractere, de 0..3, 3..6, 6..9 etc.
	// mgled -> " 24 25  0  0  0  0            999 V2000"
	// ex. countChunks[0] => nr atomi, countChunks[1] => bonds, ...
	// Aici interpretăm primele 9 caractere: 3 grupe de 3
	if len(lines[3]) < 9 {
		return molObj, fmt.Errorf("invalid .mol: can't parse counts line properly")
	}
	var countChunks []string
	for i := 0; i < len(lines[3]); i += 3 {
		chunk := lines[3][i:min(i+3, len(lines[3]))]
		countChunks = append(countChunks, chunk)
		if len(countChunks) >= 6 {
			break // doar primele 6 blocuri
		}
	}

	// Atribuim molecules, bonds, lists, chiral, stext
	molCounts := models.MolCounts{}
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
		// if '1' => chiral = true
		cVal := strings.TrimSpace(countChunks[4])
		molCounts.Chiral = (cVal == "1")
	}
	if len(countChunks) > 5 {
		molCounts.Stext = strings.TrimSpace(countChunks[5])
	}
	molObj.Counts = molCounts

	//----------------------------------------------------------------
	// PARSE ATOMS
	//----------------------------------------------------------------
	// In JS: for (let i = 4; i < 4 + parseInt(molObj.counts.molecules); i++)
	numAtoms := molObj.Counts.Molecules
	startAtoms := 4
	endAtoms := startAtoms + numAtoms
	if endAtoms > len(lines) {
		return molObj, fmt.Errorf("not enough lines for atoms, expected %d lines, have %d", endAtoms, len(lines))
	}
	var atoms []models.Atom
	for idx := startAtoms; idx < endAtoms; idx++ {
		line := lines[idx]
		if len(line) < 34 {
			// ignoring or returning error
			continue
		}
		// x => 0..10, y => 10..20, z => 20..30, type => 31..34
		xStr := strings.TrimSpace(line[0:10])
		yStr := strings.TrimSpace(line[10:20])
		zStr := strings.TrimSpace(line[20:30])
		typeStr := ""
		if len(line) >= 34 {
			typeStr = strings.TrimSpace(line[31:34])
		}

		xVal, _ := strconv.ParseFloat(xStr, 64)
		yVal, _ := strconv.ParseFloat(yStr, 64)
		zVal, _ := strconv.ParseFloat(zStr, 64)

		at := models.Atom{
			X:    xVal,
			Y:    yVal,
			Z:    zVal,
			Type: typeStr,
		}
		atoms = append(atoms, at)
	}
	molObj.Atoms = atoms

	//----------------------------------------------------------------
	// PARSE BONDS
	//----------------------------------------------------------------
	// In JS: for (i = 4+molObj.counts.molecules; i < 4 +... + bonds; i++)
	numBonds := molObj.Counts.Bonds
	startBonds := endAtoms
	endBonds := startBonds + numBonds
	if endBonds > len(lines) {
		return molObj, fmt.Errorf("not enough lines for bonds, expected %d lines, have %d", endBonds, len(lines))
	}
	var bonds []models.Bond
	for idx := startBonds; idx < endBonds; idx++ {
		line := lines[idx]
		// Ex: "  1  9  2  0  0  0  0" => atom1 in [0..3], atom2 in [3..6], bond type in [6..9]
		if len(line) < 9 {
			continue
		}
		a1Str := strings.TrimSpace(line[0:3])
		a2Str := strings.TrimSpace(line[3:6])
		bondTypeStr := strings.TrimSpace(line[6:9])

		a1, _ := strconv.Atoi(a1Str)
		a2, _ := strconv.Atoi(a2Str)
		bType, _ := strconv.Atoi(bondTypeStr)

		// .mol are index 1-based => scad 1
		bonds = append(bonds, models.Bond{
			Atom1:    a1 - 1,
			Atom2:    a2 - 1,
			BondType: bType,
		})
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
