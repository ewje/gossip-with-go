package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/ewje/gossip-with-go/internal/database"
	"github.com/ewje/gossip-with-go/internal/router"
)

func main() {
	// 1. Initialize Database
	// NOTE: Replace 'secret' with your actual password!
	dbURL := "postgres://postgres:password@localhost:5432/forum_db"
	err := database.InitDB(dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// 2. Setup Router
	r := router.Setup()

	fmt.Println("Listening on port 8000 at http://localhost:8000!")
	log.Fatalln(http.ListenAndServe(":8000", r))
}
