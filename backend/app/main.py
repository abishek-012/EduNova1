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

from app.schemas import RegisterRequest
from app.schemas import LoginRequest
from app.schemas import LoginResponse


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register")
def register(data: RegisterRequest):
    if users.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_password = hash_password(data.password)

    users.insert_one({
        "name": data.name,
        "email": data.email,
        "password": hashed_password,
        "user_type": data.user_type
    })

    return {"message": "User registered successfully"}


@app.post("/login", response_model=LoginResponse)
def login(data: LoginRequest):
    # 1. Find user
    user = users.find_one({"email": data.email})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # 2. Verify password
    if not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # 3. Create JWT
    token = jwt.encode(
        {
            "email": user["email"],
            "user_type": user["user_type"]
        },
        os.getenv("JWT_SECRET"),
        algorithm="HS256"
    )

    return {
        "access_token": token,
        "user_type": user["user_type"]
    }



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