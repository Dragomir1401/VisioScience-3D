package main

import "fmt"
import "net/http"

func main() {
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintln(w, "VisioScience 3D Backend")
    })
    fmt.Println("Server running on port 8080")
    http.ListenAndServe(":8080", nil)
}
