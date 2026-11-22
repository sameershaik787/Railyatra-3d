from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import random

app = FastAPI(title="RailYatra 3D API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store (replace with PostgreSQL / MongoDB in production)
BOOKINGS = {}

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str = "passenger"  # passenger | tte | admin

class BookingRequest(BaseModel):
    train_number: str
    coach: str
    berths: List[int]
    passenger_names: List[str]
    total_fare: float

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "RailYatra 3D Backend"}

@app.post("/api/auth/login")
def login(payload: LoginRequest):
    if payload.role not in {"passenger", "tte", "admin"}:
        raise HTTPException(status_code=400, detail="Invalid RBAC role")
    return {
        "access_token": f"demo-jwt-{payload.role}-token",
        "role": payload.role,
        "email": payload.email,
    }

@app.post("/api/bookings")
def create_booking(payload: BookingRequest):
    pnr = str(random.randint(1000000000, 9999999999))
    record = {"pnr": pnr, "status": "CONFIRMED", **payload.model_dump()}
    BOOKINGS[pnr] = record
    return record

@app.get("/api/bookings/{pnr}")
def get_pnr_status(pnr: str):
    if pnr not in BOOKINGS:
        raise HTTPException(status_code=404, detail="PNR not found")
    return BOOKINGS[pnr]

@app.get("/api/admin/metrics")
def admin_metrics(x_role: Optional[str] = Header(default="passenger")):
    if x_role != "admin":
        raise HTTPException(status_code=403, detail="Admin RBAC access required")
    return {"total_bookings": len(BOOKINGS), "active_rakes": 4}
