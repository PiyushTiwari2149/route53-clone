# Route53-Clone

A full-stack application simulating core AWS Route 53 functionality.

## Live Demo
Frontend: [PASTE YOUR VERCEL LINK HERE]

> **Note to Reviewer:** This deployment is a live demonstration of the frontend interface. To view full data persistence, please ensure the backend (FastAPI) is running locally on `localhost:8000`.

## Architecture
The application uses a decoupled architecture:
* **Frontend:** Next.js & Tailwind CSS
* **Backend:** FastAPI
* **Database:** SQLite

## Setup
1. Navigate to backend/: `pip install -r requirements.txt` then `uvicorn main:app --reload --port 8000`
2. Navigate to frontend/: `npm install` then `npm run dev`

## Database Schema
| Table | Column | Type | Description |
| :--- | :--- | :--- | :--- |
| **HostedZone** | id | UUID | Unique zone identifier |
| | name | STRING | The domain name |
| | comment | STRING | User description |
| **Record** | id | UUID | Unique record identifier |
| | hz_id | UUID | Foreign key (HostedZone) |
| | name | STRING | Subdomain/Name |
| | type | STRING | Record Type (A, CNAME, etc.) |
| | ttl | INT | Time-to-Live (seconds) |
| | val | STRING | IP/Value |

## API Overview
### Hosted Zones
* `GET /api/hz` — List all zones.
* `POST /api/hz` — Create a new zone.
* `DELETE /api/hz/{id}` — Remove a zone.

### Resource Records
* `GET /api/hz/{id}/rec` — View records for a zone.
* `POST /api/hz/{id}/rec` — Add a new record.
* `DELETE /api/rec/{id}` — Delete a record.
