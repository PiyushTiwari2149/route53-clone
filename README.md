# Route53-Clone

A high-performance, full-stack DNS management interface.

Welcome to the Route53-Clone! This project provides a streamlined, intuitive dashboard designed to simulate core AWS Route 53 functionality, allowing for efficient management of hosted zones and DNS records.

## 🚀 Live Demo
Frontend: https://route53-frontend.vercel.app/

> **Note to Reviewer:** This deployment hosts the frontend interface. To experience the full application with data persistence, please ensure the backend (FastAPI) is running locally on `localhost:8000`.

## 🏗️ Architecture Overview
This application is built on a decoupled, three-tier architecture ensuring scalability and separation of concerns.



* **Frontend:** Built with **Next.js** and **Tailwind CSS**, providing a fast, responsive, and modern user experience.
* **Backend:** A robust **FastAPI** server that manages the business logic and orchestrates DNS operations.
* **Database:** Utilizes **SQLite** for lightweight, reliable local data storage.

## 🛠️ Setup Instructions
Get the project running locally in minutes by following these steps:

### Prerequisites
* Node.js (v18+)
* Python (v3.9+)

### 1. Backend Setup
1. Navigate to the `backend/` directory.
2. Install dependencies: `pip install -r requirements.txt`.
3. Start the server: `uvicorn main:app --reload --port 8000`.

### 2. Frontend Setup
1. Navigate to the `frontend/` directory.
2. Install dependencies: `npm install`.
3. Start the development server: `npm run dev`.

## 🗄️ Database Schema
The data model is structured for clarity and efficiency.

| Table | Column | Type | Description |
| :--- | :--- | :--- | :--- |
| **HostedZone** | `id` | UUID | Unique zone identifier |
| | `name` | STRING | The domain name |
| | `comment` | STRING | User description |
| **Record** | `id` | UUID | Unique record identifier |
| | `hz_id` | UUID | Foreign key (HostedZone) |
| | `name` | STRING | Subdomain/Name |
| | `type` | STRING | Record Type (A, CNAME, etc.) |
| | `ttl` | INT | Time-to-Live (seconds) |
| | `val` | STRING | IP/Value |

## 🌐 API Overview
The backend provides a clean, documented RESTful API.

### Hosted Zones
* `GET /api/hz` — List all zones.
* `POST /api/hz` — Create a new zone.
* `DELETE /api/hz/{id}` — Remove a zone and its records.

### Resource Records
* `GET /api/hz/{id}/rec` — View records for a zone.
* `POST /api/hz/{id}/rec` — Add a new record.
* `DELETE /api/rec/{id}` — Delete a specific record.
