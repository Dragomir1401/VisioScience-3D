package handlers

import (
    "context"
    "encoding/json"
    "net/http"

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
    log.Println("Creating formula")

    shape := r.URL.Path[len("/formulas/"):]
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
    log.Println("Getting formula")

    shape := r.URL.Path[len("/formulas/"):]
    collection := client.Database("formulasdb").Collection("formulas")
    cursor, err := collection.Find(context.TODO(), bson.M{"shape": shape})
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    var results []Formula
    if err := cursor.All(context.TODO(), &results); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    json.NewEncoder(w).Encode(results)
}
