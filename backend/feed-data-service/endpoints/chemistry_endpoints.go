package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	helpers "feed-data-service/helpers"
	"feed-data-service/models"
	prettifier "feed-data-service/prettifier"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// CreateMolecule - POST /chem/molecules
// Primește JSON cu name, formula, molFile etc.
func CreateMolecule(w http.ResponseWriter, r *http.Request) {
	log.Println("[CreateMolecule] Received request to create a new molecule")
	w.Header().Set("Content-Type", "application/json")

	// Decodificăm în structura intermediară
	var req models.MoleculeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Log pentru a verifica datele primite
	log.Println("[CreateMolecule] Received data:", req.Name, req.Description)

	// Mapăm datele din structura intermediară în structura Molecule
	var mol models.Molecule
	mol.Metadata.Name = req.Name
	mol.Metadata.Description = req.Description
	mol.Formula = req.Formula
	mol.MolFile = req.MolFile

	// Procesăm fișierul .mol
	parsed, parseErr := prettifier.ParseMolFile(mol.MolFile)
	if parseErr != nil {
		log.Println("[CreateMolecule] ParseMolFile error (ignored):", parseErr)
	} else {
		mol.ParsedData = parsed
	}

	// Completează datele suplimentare
	mol.ID = primitive.NewObjectID()
	mol.Metadata.CreatedAt = time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	log.Println("[CreateMolecule] Inserting molecule:", mol.Metadata.Name)
	collection := helpers.Client.Database("data-feed-db").Collection("molecules")

	result, err := collection.InsertOne(ctx, mol)
	if err != nil {
		log.Println("[CreateMolecule] DB insertion error:", err)
		http.Error(w, "Failed to insert molecule", http.StatusInternalServerError)
		return
	}
	insertedID := result.InsertedID.(primitive.ObjectID)

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Molecule created (best effort)",
		"id":      insertedID.Hex(),
	})
}

// GetAllMolecules - GET /chem/molecules
// Returnează lista completă de molecule
func GetAllMolecules(w http.ResponseWriter, r *http.Request) {
	log.Println("[GetAllMolecules] Received request to get all molecules")
	w.Header().Set("Content-Type", "application/json")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	log.Println("[GetAllMolecules] Fetching all molecules")

	collection := helpers.Client.Database("data-feed-db").Collection("molecules")
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		log.Println("[GetAllMolecules] Find error:", err)
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var molecules []models.Molecule
	if err := cursor.All(ctx, &molecules); err != nil {
		http.Error(w, "Decode error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(molecules)
}

// GetMoleculeByID - GET /chem/molecules/{id}
func GetMoleculeByID(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	idStr := mux.Vars(r)["id"]

	objID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var mol models.Molecule
	collection := helpers.Client.Database("data-feed-db").Collection("molecules")
	err = collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&mol)
	if err != nil {
		log.Println("[GetMoleculeByID] error:", err)
		if err.Error() == "mongo: no documents in result" {
			http.Error(w, "Not found", http.StatusNotFound)
			return
		}
		http.Error(w, "DB error", http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(mol)
}

// UpdateMolecule - PUT /chem/molecules/{id}
func UpdateMolecule(w http.ResponseWriter, r *http.Request) {
	log.Println("[UpdateMolecule] Received request to update molecule")
	w.Header().Set("Content-Type", "application/json")
	idStr := mux.Vars(r)["id"]

	objID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	// Decodificăm cererea într-un tip intermediar
	var req models.MoleculeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Log pentru a verifica datele primite
	log.Println("[UpdateMolecule] Received data:", req.Name, req.Description)

	// Mapăm datele primite în structura Molecule
	var updatedMol models.Molecule
	updatedMol.Metadata.Name = req.Name
	updatedMol.Metadata.Description = req.Description
	updatedMol.Formula = req.Formula
	updatedMol.MolFile = req.MolFile

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	log.Println("[UpdateMolecule]", updatedMol.Metadata.Name)

	// Build un map pt "$set". Tot "best effort"
	updateFields := bson.M{
		"name":        updatedMol.Metadata.Name,
		"formula":     updatedMol.Formula,
		"description": updatedMol.Metadata.Description,
	}

	// Dacă a venit totuși `MolFile` => îl parsez best effort
	if updatedMol.MolFile != "" {
		updateFields["molFile"] = updatedMol.MolFile

		parsed, parseErr := prettifier.ParseMolFile(updatedMol.MolFile)
		if parseErr != nil {
			log.Println("[UpdateMolecule] ParseMolFile error (ignored):", parseErr)
			// punem un `MolParsedData` gol, doar ca exemplu
			updateFields["parsedData"] = models.MolParsedData{}
		} else {
			updateFields["parsedData"] = parsed
		}
	}

	update := bson.M{"$set": updateFields}

	collection := helpers.Client.Database("data-feed-db").Collection("molecules")
	result, err := collection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if result.MatchedCount == 0 {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":        "Molecule updated (best effort)",
		"matched_count":  result.MatchedCount,
		"modified_count": result.ModifiedCount,
	})
}

// DeleteMolecule - DELETE /chem/molecules/{id}
func DeleteMolecule(w http.ResponseWriter, r *http.Request) {
	log.Println("[DeleteMolecule] Received request to delete molecule")
	w.Header().Set("Content-Type", "application/json")
	idStr := mux.Vars(r)["id"]

	objID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := helpers.Client.Database("data-feed-db").Collection("molecules")
	result, err := collection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if result.DeletedCount == 0 {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":       "Molecule deleted",
		"deleted_count": result.DeletedCount,
	})
}

// GetMolecule3D - GET /chem/molecules/{id}/3d
func GetMolecule3D(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	idStr := mux.Vars(r)["id"]

	objID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var result struct {
		ParsedData models.MolParsedData `bson:"parsedData" json:"parsedData"`
	}
	collection := helpers.Client.Database("data-feed-db").Collection("molecules")
	err = collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, "Not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Returnăm direct JSON-ul din result.ParsedData
	json.NewEncoder(w).Encode(result.ParsedData)
}
