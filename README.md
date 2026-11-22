# RailYatra 3D - Spatial Indian Railways Ticket Booking Portal

## Project Brief
- **Category:** Full-Stack Web Application & Interactive 3D WebGL System
- **Architecture:** Decoupled Client-Server (`frontend/` + `backend/`)
- **Core Capabilities:** Interactive 3D LHB Coach Viewer (3A, 2A, 1A), Day/Night Berth Folding, 1st-Person POV Walkthrough, Role-Based Access Control (Passenger, TTE, Admin), and IRCTC-style Checkout & Electronic Reservation Slip (ERS) Generation.

## Project Description
**RailYatra 3D** is a full-stack virtual railway ticket booking platform designed to modernize the Indian Railways booking experience. Inspired by MakeMyTrip and IRCTC, it replaces static seat-number lists with an interactive **3D LHB coach viewer** built in Three.js. Passengers can inspect AC 3-Tier (3A), AC 2-Tier (2A), and First AC (1A) coaches in real time, toggle between Day and Night berth configurations, switch to a 1st-person POV to check legroom and sightlines, and select specific berths before completing a simulated checkout that generates a 10-digit PNR and Electronic Reservation Slip (ERS).

## Advanced Technical Summary
- **Spatial 3D Rendering (`Three.js`):** The coach visualization engine (`frontend/src/three/Coach3DViewer.jsx`) uses `THREE.LOD` (Level of Detail) to balance visual realism with smooth frame rates, dynamically rendering 3A, 2A, and 1A LHB coach layouts with Day/Night berth folding and 1st-person POV controls.
- **Modular Frontend (`React + Vite + Tailwind CSS`):** Static datasets (train catalogs, quotas, stations, e-catering menus, saved travellers) are isolated in `frontend/src/data/railData.js`, while interactive UI modules (`LiveRailCorridorDeck`, checkout modals, ERS slips) live in `frontend/src/components/`.
- **RESTful Backend & RBAC (`FastAPI + Python`):** The backend (`backend/app/main.py`) runs on FastAPI and Uvicorn with Pydantic validation and CORS middleware, exposing role-gated endpoints for authentication (`/api/auth/login`), PNR bookings (`/api/bookings`, `/api/bookings/{pnr}`), and admin telemetry (`/api/admin/metrics`).
- **Deployment:** Structured for independent CI/CD deployment on **Vercel** (`frontend`) and **Render** (`backend`).

## Tech Stack
| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend UI** | React, Vite, Tailwind CSS, Lucide Icons |
| **3D Graphics Engine** | Three.js (`THREE.LOD`, WebGLRenderer) |
| **Backend API** | Python, FastAPI, Uvicorn, Pydantic, `python-dotenv` |
| **Version Control ** | Git, GitHub|

## API Keys & Data Sources
No paid third-party API key is required to run this project. RailYatra 3D uses a custom **FastAPI** backend for RBAC authentication and PNR booking logic alongside structured local datasets (`railData.js`) so the app stays zero-cost and reliable during live demos. Live IRCTC/RapidAPI keys can optionally be added later via `backend/.env`.

## Local Setup

### Backend (FastAPI)
```Terminal
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
