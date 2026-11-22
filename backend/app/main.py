from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import random

app = FastAPI(title="RailYatra 3D API", version="1.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BOOKINGS: Dict[str, dict] = {}
FOOD_ORDERS: Dict[str, dict] = {}

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str = "passenger"

class BookingRequest(BaseModel):
    train_number: str
    coach: str
    berths: List[int]
    passenger_names: List[str]
    total_fare: float

class FoodOrderRequest(BaseModel):
    pnr: str
    station_code: str
    coach_berth: str
    partners: List[str] = ["Swiggy"]
    mobile_number: Optional[str] = None
    items: List[Dict[str, Any]]
    total_amount: float

class MobileUpdateRequest(BaseModel):
    mobile_number: str

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

@app.get("/api/food/pnr/{pnr}")
def get_food_route_by_pnr(pnr: str):
    booking = BOOKINGS.get(pnr)
    return {
        "pnr": pnr,
        "train_number": booking["train_number"] if booking else "12952",
        "coach": booking["coach"] if booking else "B4",
        "live_speed_kmph": 118,
        "gps_lock": True,
        "upcoming_stations": [
            {"code": "KOTA", "name": "Kota Jn", "eta": "21:35", "halt_mins": 10},
            {"code": "RTM", "name": "Ratlam Jn", "eta": "00:40", "halt_mins": 5},
            {"code": "BRC", "name": "Vadodara Jn", "eta": "03:50", "halt_mins": 10},
            {"code": "ST", "name": "Surat", "eta": "05:25", "halt_mins": 5},
        ],
    }

@app.post("/api/food/orders")
def place_food_order(payload: FoodOrderRequest):
    order_id = f"RYF{random.randint(100000, 999999)}"
    record = {
        "order_id": order_id,
        "status": "AWAITING_MOBILE" if not payload.mobile_number else "PREPARING_AT_STATION",
        **payload.model_dump(),
    }
    FOOD_ORDERS[order_id] = record
    return record

@app.patch("/api/food/orders/{order_id}/mobile")
def attach_mobile_number(order_id: str, payload: MobileUpdateRequest):
    if order_id not in FOOD_ORDERS:
        raise HTTPException(status_code=404, detail="Food order not found")
    FOOD_ORDERS[order_id]["mobile_number"] = payload.mobile_number
    FOOD_ORDERS[order_id]["status"] = "PREPARING_AT_STATION"
    return FOOD_ORDERS[order_id]

@app.get("/api/food/orders/{order_id}")
def track_food_order(order_id: str):
    if order_id not in FOOD_ORDERS:
        raise HTTPException(status_code=404, detail="Food order not found")
    return FOOD_ORDERS[order_id]

@app.get("/api/admin/metrics")
def admin_metrics(x_role: Optional[str] = Header(default="passenger")):
    if x_role != "admin":
        raise HTTPException(status_code=403, detail="Admin RBAC access required")
    return {
        "total_bookings": len(BOOKINGS),
        "total_food_orders": len(FOOD_ORDERS),
        "active_rakes": 4,
    }