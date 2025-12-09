package database

import (
	"context"
	"fmt"
	"sync"

	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	dbInstance *Database
	once       sync.Once
)

type Database struct {
	Pool *pgxpool.Pool
}

// InitDB initializes the database connection pool.
// Call this once in main.go
func InitDB(connString string) error {
	var err error
	once.Do(func() {
		pool, poolErr := pgxpool.New(context.Background(), connString)
		if poolErr != nil {
			err = poolErr
			return
		}
		dbInstance = &Database{Pool: pool}
	})
	return err
}

// GetDB returns the initialized database instance
func GetDB() (*Database, error) {
	if dbInstance == nil {
		return nil, fmt.Errorf("database not initialized")
	}
	return dbInstance, nil
}
