from jose import jwt
import os

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

from app.scheduler.timetable import generate_weekly_timetable

from fastapi import HTTPException
from app.database import users
from app.security import hash_password
from app.security import verify_password


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register")
def register(data: dict):
    # Check if email already exists
    if users.find_one({"email": data["email"]}):
        raise HTTPException(status_code=400, detail="User already exists")

    data["user_type"] = "student"

    # Hash password before saving
    data["password"] = hash_password(data["password"])

    # Insert into MongoDB
    users.insert_one(data)

    return {"message": "User registered successfully"}


@app.post("/login")
def login(data: dict):
    # 1. Find user by email
    user = users.find_one({"email": data["email"]})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # 2. Verify password
    if not verify_password(data["password"], user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # 3. Create JWT with role
    token = jwt.encode(
        {
            "email": user["email"],
            "user_type": user["user_type"]
        },
        os.getenv("JWT_SECRET"),
        algorithm="HS256"
    )

    return {"token": token}



@app.post("/generate")
async def generate(
    num_classes: int = Form(...),
    periods_per_day: int = Form(...),
    days: str = Form(...),
    file: UploadFile = File(...)
):
    # Convert days string back to list
    days_list = days.split(",")

    # Read Excel file
    df = pd.read_excel(file.file)

    subjects = []
    subject_teacher = {}

    for _, row in df.iterrows():
        subject = str(row["Subject"]).strip()
        teacher = str(row["Teacher"]).strip()
        subjects.append(subject)
        subject_teacher[subject] = teacher

    weekly_tt, classes = generate_weekly_timetable(
        num_classes,
        days_list,
        periods_per_day,
        subjects,
        subject_teacher
    )

    return {
        "timetable": weekly_tt,
        "classes": classes,
        "days": days_list,
        "periods": periods_per_day
    }