from fastapi import FastAPI
from database import engine, Base, SessionLocal
from models import User,CleaningTask
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
import os
from dotenv import load_dotenv

load_dotenv()

MAIN_ADMIN_ID = os.getenv("MAIN_ADMIN_ID")
MAIN_ADMIN_PASSWORD = os.getenv("MAIN_ADMIN_PASSWORD")

@app.get("/")
def home():
    return {
        "message": "iC Clean Campus Backend is Running"
    }


@app.post("/register")
def register_user(
    name: str,
    gr_number: str,
    password: str
):
    db = SessionLocal()

    existing_user = db.query(User).filter(
        User.gr_number == gr_number
    ).first()

    if existing_user:
        db.close()
        return {
            "message": "GR Number already registered"
        }

    user = User(
        name=name,
        login_id=gr_number,
        gr_number=gr_number,
        password=password,
        role="student"
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()

    return {
        "message": "Student registered successfully",
        "student_id": user.id
    }

@app.post("/login")
def login_user(
    login_id: str,
    password: str
):
    if login_id == MAIN_ADMIN_ID and password == MAIN_ADMIN_PASSWORD:
        return {
            "message": "Login successful",
            "user_id": 0,
            "name": "Main Admin",
            "login_id": MAIN_ADMIN_ID,
            "role": "main_admin"
        }

    db = SessionLocal()

    user = db.query(User).filter(
        User.login_id == login_id,
        User.password == password
    ).first()

    db.close()

    if not user:
        return {
            "message": "Invalid ID or Password"
        }

    return {
        "message": "Login successful",
        "user_id": user.id,
        "name": user.name,
        "login_id": user.login_id,
        "gr_number": user.gr_number,
        "role": user.role,
        "area": user.area
    }
@app.post("/main-admin/add-user")
def add_user(
    name: str,
    login_id: str,
    password: str,
    role: str,
    area: str
):
    db = SessionLocal()

    if role not in ["admin", "staff"]:
        db.close()
        return {"message": "Invalid role"}

    existing_user = db.query(User).filter(
        User.login_id == login_id
    ).first()

    if existing_user:
        db.close()
        return {"message": "Login ID already registered"}

    user = User(
        name=name,
        login_id=login_id,
        gr_number=None,
        password=password,
        role=role,
        area=area
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()

    return {
        "message": role.capitalize() + " created successfully",
        "user_id": user.id,
        "name": user.name,
        "login_id": user.login_id,
        "area": user.area,
        "role": user.role
    }
    db = SessionLocal()

    if role not in ["admin", "staff"]:
        db.close()
        return {
            "message": "Invalid role"
        }

    existing_user = db.query(User).filter(
        User.gr_number == gr_number
    ).first()

    if existing_user:
        db.close()
        return {
            "message": "ID already registered"
        }

    user = User(
        name=name,
        gr_number=gr_number,
        password=password,
        role=role
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()

    return {
        "message": role.capitalize() + " created successfully",
        "user_id": user.id,
        "name": user.name,
        "gr_number": user.gr_number,
        "area": area,
        "role": user.role
    }
@app.post("/cleaning-tasks")
def create_cleaning_task(
    title: str,
    description: str,
    location: str,
    area: str,
    priority: str,
    staff_id: int
):
    db = SessionLocal()

    task = CleaningTask(
        title=title,
        description=description,
        location=location,
        area=area,
        priority=priority,
        staff_id=staff_id,
        status="assigned"
    )

    db.add(task)
    db.commit()
    db.refresh(task)
    db.close()

    return {
        "message": "Cleaning task assigned successfully",
        "task_id": task.id,
        "staff_id": task.staff_id,
        "area": task.area,
        "status": task.status
    }