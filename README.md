# Mork SDK Demo: MediGraph

A backend service demonstrating the capabilities of the Mork Rust SDK for MeTTa-based knowledge graph operations. This application manages drug interactions and patient medication risks by leveraging Mork's pattern matching and inference engine.

## Features

- **Ingest Drug Interactions**: Upload interaction rules (e.g., "Aspirin interacts with Warfarin").
- **Patient Management**: Add medication records to patient-specific namespaces.
- **Risk Analysis**: Automatically detect dangerous drug combinations using graph transformation rules.

## Architecture

The project follows a modular structure:

- `src/models`: Data Transfer Objects (DTOs) for API requests/responses.
- `src/services`: Business logic and Mork SDK integration (`GraphService`).
- `src/routes`: HTTP endpoint definitions (`health`, `ingest`, `patient`).
- `src/main.rs`: Application entry point and server configuration.

## Prerequisites

- Rust (latest stable)
- A running instance of the Mork Knowledge Graph server (default: `localhost:8001`)

## API Endpoints

### 1. Health Check
`GET /`
- **Response**: "MediGraph API is Online"

### 2. Ingest Interaction
`POST /ingest/interactions`
- **Body**:
  ```json
  {
    "drug_a": "Aspirin",
    "drug_b": "Warfarin",
    "severity": "High"
  }
  ```

### 3. Add Medication
`POST /patient/add_medication`
- **Body**:
  ```json
  {
    "user_id": "john_doe",
    "drug": "Aspirin"
  }
  ```

### 4. Check Risks
`GET /patient/check_risks/<user_id>`
- **Response**:
  ```json
  {
    "user_id": "john_doe",
    "findings": [
      "(Warning Aspirin Warfarin High)"
    ]
  }
  ```

## Running the Project

1. Ensure the Mork server is running.
2. Start the backend:
   ```bash
   cd backend
   cargo run
   ```
3. The server will start on `0.0.0.0:8000`.

## Testing

You can use the provided `.rest` file or `curl` to test the endpoints.

```bash
# Example: Check risks for a user
curl http://localhost:8000/patient/check_risks/john_doe
```
