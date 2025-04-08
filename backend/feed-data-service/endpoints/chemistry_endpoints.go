package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"feed-data-service/models"

	helpers "feed-data-service/helpers"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var chemCollection = helpers.Client.Database("data-feed-db").Collection("molecules")

// CreateMolecule - POST /chem/molecules
// Primește JSON cu name, formula, molFile etc.
func CreateMolecule(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var mol models.Molecule
	if err := json.NewDecoder(r.Body).Decode(&mol); err != nil {
		http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Validări minime
	if mol.Name == "" {
		http.Error(w, "Missing name", http.StatusBadRequest)
		return
	}
	if mol.MolFile == "" {
		http.Error(w, "Missing molFile data", http.StatusBadRequest)
		return
	}

	// Completează date extra
	mol.ID = primitive.NewObjectID()
	mol.CreatedAt = time.Now()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	log.Println("[CreateMolecule] Inserting molecule:", mol.Name)

	result, err := chemCollection.InsertOne(ctx, mol)
	if err != nil {
		log.Println("[CreateMolecule] DB insertion error:", err)
		http.Error(w, "Failed to insert molecule", http.StatusInternalServerError)
		return
	}
	insertedID := result.InsertedID.(primitive.ObjectID)

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Molecule created",
		"id":      insertedID.Hex(),
	})
}

// GetAllMolecules - GET /chem/molecules
// Returnează lista completă de molecule
func GetAllMolecules(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	log.Println("[GetAllMolecules] Fetching all molecules")

	cursor, err := chemCollection.Find(ctx, bson.M{})
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
	err = chemCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&mol)
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
	w.Header().Set("Content-Type", "application/json")
	idStr := mux.Vars(r)["id"]

	objID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	var updatedMol models.Molecule
	if err := json.NewDecoder(r.Body).Decode(&updatedMol); err != nil {
		http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	log.Println("[UpdateMolecule]", updatedMol.Name)

	update := bson.M{"$set": bson.M{
		"name":        updatedMol.Name,
		"formula":     updatedMol.Formula,
		"molFile":     updatedMol.MolFile,
		"description": updatedMol.Description,
	}}

	result, err := chemCollection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if result.MatchedCount == 0 {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":        "Molecule updated",
		"matched_count":  result.MatchedCount,
		"modified_count": result.ModifiedCount,
	})
}

// DeleteMolecule - DELETE /chem/molecules/{id}
func DeleteMolecule(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	idStr := mux.Vars(r)["id"]

	objID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := chemCollection.DeleteOne(ctx, bson.M{"_id": objID})
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
