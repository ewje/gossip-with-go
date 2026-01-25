# Gossip with Go

Ethan Wong Jing En

## Setup Instructions
This project uses Docker to run PostgreSQL.

Prerequisites:
Ensure that you have the following installed
* Go
* Node.js and npm
* Docker

Backend Setup

1. Start the Database
    Run the following command to start a Postgres instance
    ```bash
    docker run --name forum_db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=forum_db -p 5432:5432 -d postgres
    ```

2. Run migration
    Run the following commands to initialize the database schema using the migration files.

    Navigate to the backend directory first:
    ```bash
    cd go
    ```

    Then run this command to initialize the database schema using the migration files.
    ```bash
    migrate -path internal/database/migration -database "postgresql://postgres:password@localhost:5432/forum_db?sslmode=disable" -verbose up
    ```

3. Start the backend
    Install dependencies
    ```bash
    go mod download
    ```

    Start the server
    ```bash
    go run cmd/main.go
    ```

    You should see "Listening on port 8000 at http://localhost:8000!"


Frontend Setup

1. Start the frontend
    Open a new terminal and navigate to the frontend directory
    ```bash
    cd react
    ```

    Install dependencies
    ```bash
    npm install
    ```

    Start the development server
    ```bash
    npm run dev
    ```

    Open the link provided in the terminal to view the application


AI Declaration

AI tool: Google Gemini 3
Uses:
- Asked to explain code in sample go app and sample react app provided by CVWO in simple terms
- List of available database tools and thier advantages
- Asked for possible reasons for a bug where URLParam was not able to get the topic id.
- list of docker and golang-migrate commands I might need.
- Asked for different methods to fix margin issues in the UI.
