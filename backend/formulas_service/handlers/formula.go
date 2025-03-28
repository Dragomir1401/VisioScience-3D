package handlers

import (
    "context"
    "encoding/json"
    "log"
    "net/http"
    "time"

    "github.com/gorilla/mux"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
)

var client *mongo.Client

func init() {
    var err error
    client, err = mongo.Connect(context.TODO(), options.Client().ApplyURI("mongodb://root:example@mongodb:27017"))
    if err != nil {
        panic(err)
    }
}

type Formula struct {
    Shape string `json:"shape"`
    Name  string `json:"name"`
    Expr  string `json:"expr"`
}

func CreateFormula(w http.ResponseWriter, r *http.Request) {
    log.Println("Creating formula...")

    shape := mux.Vars(r)["shape"]
    var f Formula
    if err := json.NewDecoder(r.Body).Decode(&f); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    f.Shape = shape

    collection := client.Database("formulasdb").Collection("formulas")
    _, err := collection.InsertOne(context.TODO(), f)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    w.WriteHeader(http.StatusCreated)
}

func GetFormulas(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    shape := mux.Vars(r)["shape"]

    log.Printf("Getting formulas for shape: %s", shape)

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    collection := client.Database("formulasdb").Collection("formulas")
    cursor, err := collection.Find(ctx, bson.M{"shape": shape})
    if err != nil {
        http.Error(w, "Failed to fetch formulas", http.StatusInternalServerError)
        return
    }
    defer cursor.Close(ctx)

    var formulas []Formula
    if err := cursor.All(ctx, &formulas); err != nil {
        http.Error(w, "Failed to decode formulas", http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(formulas)
}
