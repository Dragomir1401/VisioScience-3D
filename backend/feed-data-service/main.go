package main

import (
	"log"
	"net/http"

	handlers "feed-data-service/endpoints"
	helpers "feed-data-service/helpers"

	gorillaHandlers "github.com/gorilla/handlers"

	"github.com/gorilla/mux"
)

func main() {
	r := mux.NewRouter()

	// init mongo client
	helpers.InitMongoClient()

	// CORS middleware to accept all origins for development purposes
	corsObj := gorillaHandlers.CORS(
		gorillaHandlers.AllowedOrigins([]string{"*"}), // Allow all origins for development purposes
		gorillaHandlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		gorillaHandlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
	)

	// POST /feeds
	r.HandleFunc("/feed", handlers.CreateFeed).Methods("POST")
	// GET /feeds
	r.HandleFunc("/feed/{id}", handlers.GetFeedByID).Methods("GET")
	// GET /feeds
	r.HandleFunc("/feed/{id}", handlers.UpdateFeedByID).Methods("PUT")
	// GET /feeds
	r.HandleFunc("/feed/{id}", handlers.DeleteFeedByID).Methods("DELETE")
	// GET /feeds
	r.HandleFunc("/feed/shape/{shape}", handlers.GetFeedsByShape).Methods("GET")

	// GET /chem/molecules
	r.HandleFunc("/feed/chem/molecules", handlers.GetAllMolecules).Methods("GET")
	// POST /chem/molecules
	r.HandleFunc("/feed/chem/molecules", handlers.CreateMolecule).Methods("POST")
	// GET /chem/molecules/{id}
	r.HandleFunc("/feed/chem/molecules/{id}", handlers.GetMoleculeByID).Methods("GET")
	// PUT /chem/molecules/{id}
	r.HandleFunc("/feed/chem/molecules/{id}", handlers.UpdateMolecule).Methods("PUT")
	// DELETE /chem/molecules/{id}
	r.HandleFunc("/feed/chem/molecules/{id}", handlers.DeleteMolecule).Methods("DELETE")
	// GET /chem/molecules/{id}/3d
	r.HandleFunc("/feed/chem/molecules/{id}/3d", handlers.GetMolecule3D).Methods("GET")

	log.Println("feed-data-service running on :8080")
	if err := http.ListenAndServe(":8080", corsObj(r)); err != nil {
		log.Fatal(err)
	}
}
