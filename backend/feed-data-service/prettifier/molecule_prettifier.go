package handlers

import (
	"feed-data-service/models"
	"fmt"
	"strconv"
	"strings"
)

func ParseMolFile(molText string) (models.MolParsedData, error) {
	var parsed models.MolParsedData

	// 1) Împarte linii
	lines := strings.Split(molText, "\n")
	if len(lines) < 5 {
		return parsed, fmt.Errorf("invalid .mol: too short")
	}

	// 2) Citim linia cu atomi/bonduri: lines[3], ex: " 24 25  0  0  0  0            999 V2000"
	countLine := lines[3]
	if len(countLine) < 6 {
		return parsed, fmt.Errorf("invalid .mol: can't parse counts")
	}

	// primele 3 caractere => nr atomi
	atomCountStr := strings.TrimSpace(countLine[0:3])
	// următoarele 3 caractere => nr bonduri
	bondCountStr := strings.TrimSpace(countLine[3:6])

	atomCount, err := strconv.Atoi(atomCountStr)
	if err != nil {
		return parsed, fmt.Errorf("invalid atom count: %v", err)
	}
	bondCount, err := strconv.Atoi(bondCountStr)
	if err != nil {
		return parsed, fmt.Errorf("invalid bond count: %v", err)
	}

	// 3) Parcurge atomi (ex. 4 + i)
	var atoms []models.Atom
	startAtoms := 4
	if len(lines) < startAtoms+atomCount {
		return parsed, fmt.Errorf("not enough lines for atoms")
	}
	for i := 0; i < atomCount; i++ {
		line := lines[startAtoms+i]
		if len(line) < 34 {
			continue // sau return err
		}
		// parse x,y,z - ex. pos(0..9), (10..19), (20..29)
		xStr := strings.TrimSpace(line[0:10])
		yStr := strings.TrimSpace(line[10:20])
		zStr := strings.TrimSpace(line[20:30])
		typeStr := strings.TrimSpace(line[31:34])

		xVal, _ := strconv.ParseFloat(xStr, 64)
		yVal, _ := strconv.ParseFloat(yStr, 64)
		zVal, _ := strconv.ParseFloat(zStr, 64)

		a := models.Atom{
			X:    xVal,
			Y:    yVal,
			Z:    zVal,
			Type: typeStr,
		}
		atoms = append(atoms, a)
	}

	// 4) Parcurge bonduri
	var bonds []models.Bond
	startBonds := startAtoms + atomCount
	endBonds := startBonds + bondCount
	if len(lines) < endBonds {
		return parsed, fmt.Errorf("not enough lines for bonds")
	}
	for i := startBonds; i < endBonds; i++ {
		line := lines[i]
		// ex. "  1  9  2  0  0  0  0"
		if len(line) < 9 {
			continue
		}
		a1Str := strings.TrimSpace(line[0:3])
		a2Str := strings.TrimSpace(line[3:6])
		bondTypeStr := strings.TrimSpace(line[6:9])

		a1, _ := strconv.Atoi(a1Str)
		a2, _ := strconv.Atoi(a2Str)
		bType, _ := strconv.Atoi(bondTypeStr)

		// .mol index is 1-based
		bond := models.Bond{
			Atom1:    a1 - 1, // facem 0-based
			Atom2:    a2 - 1,
			BondType: bType,
		}
		bonds = append(bonds, bond)
	}

	parsed.Atoms = atoms
	parsed.Bonds = bonds

	return parsed, nil
}
