Route53-Clone
A full-stack application simulating AWS Route 53 functionality, enabling users to manage hosted zones and DNS records.

**🚀 Live Demo**
Frontend: https://route53-frontend.vercel.app/

Note to Reviewer: This deployment is a live demonstration of the frontend interface. To view full data persistence, please ensure the backend (FastAPI) is running locally on localhost:8000.

**🏗️ Architecture Overview**
The application follows a standard decoupled architecture, separating the client-side UI from the server-side logic and persistence layer.

      Frontend: Built with Next.js 16+ and Tailwind CSS for a responsive, fast-loading dashboard.

      Backend: FastAPI provides a high-performance RESTful API to handle DNS operations and state management.

      Database: [Insert Database, e.g., SQLite/PostgreSQL] stores the state of all Hosted Zones and associated Resource Records.

**🛠️ Setup Instructions**
Prerequisites

            Node.js (v18+)
            Python (v3.9+)
            Database tool, if applicable

Backend Setup
1.Navigate to the backend/ directory.
2.Install dependencies:
        pip install -r requirements.txt
3.Start the server:
        uvicorn main:app --reload --port 8000

**Frontend Setup**
1.Navigate to the frontend/ directory.
2.Install dependencies:
        npm install
3.Start the development server:
        npm run dev

# Route53-Clone

A full-stack application simulating core AWS Route 53 functionality.

## Live Demo
Frontend: [PASTE YOUR VERCEL LINK HERE]

## Architecture
The application uses a decoupled architecture:
* **Frontend:** Next.js & Tailwind CSS
* **Backend:** FastAPI
* **Database:** SQLite

## Setup
1. Navigate to backend/: `pip install -r requirements.txt` then `uvicorn main:app --reload`
2. Navigate to frontend/: `npm install` then `npm run dev`








        
