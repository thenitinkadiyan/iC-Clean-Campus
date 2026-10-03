from fastapi import FastAPI
from database import engine, Base, SessionLocal
from models import User,CleaningTask,Report
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
@app.get("/cleaning-tasks/staff/{staff_id}")
def get_staff_task(staff_id: int):
    db = SessionLocal()

    task = db.query(CleaningTask).filter(
        CleaningTask.staff_id == staff_id,
        CleaningTask.status == "assigned"
    ).first()

    db.close()

    if not task:
        return {
            "message": "No cleaning task assigned"
        }

    return {
        "task_id": task.id,
        "title": task.title,
        "description": task.description,
        "location": task.location,
        "area": task.area,
        "priority": task.priority,
        "status": task.status
    }
@app.get("/staff")
def get_staff():

    db = SessionLocal()

    staff_members = db.query(User).filter(
        User.role == "staff"
    ).all()

    result = []

    for staff in staff_members:
        result.append({
            "user_id": staff.id,
            "name": staff.name,
            "login_id": staff.login_id,
            "area": staff.area
        })

    db.close()

    return result
@app.post("/reports")
def create_report(
    student_id: int,
    problem: str,
    location: str,
    description: str = "",
    photo: str = "",
    area: str = ""
):
    db = SessionLocal()

    report = Report(
        student_id=student_id,
        problem=problem,
        location=location,
        description=description,
        photo=photo,
        area=area,
        status="submitted"
    )

    db.add(report)
    db.commit()
    db.refresh(report)
    db.close()

    return {
        "message": "Report submitted successfully",
        "report_id": report.id,
        "status": report.status
    }
@app.get("/reports")
def get_reports():
    db = SessionLocal()

    reports = db.query(Report).order_by(
        Report.id.desc()
    ).all()

    result = []

    for report in reports:
        result.append({
            "id": report.id,
            "student_id": report.student_id,
            "problem": report.problem,
            "location": report.location,
            "description": report.description,
            "photo": report.photo,
            "area": report.area,
            "status": report.status,
            "assigned_staff_id": report.assigned_staff_id,
            "pending_reason": report.pending_reason
        })

    db.close()

    return result
@app.get("/admin/stats")
def get_admin_stats():
    db = SessionLocal()

    total_reports = db.query(Report).count()

    in_progress = db.query(Report).filter(
        Report.status.in_(["assigned", "cleaning", "in_progress"])
    ).count()

    resolved = db.query(Report).filter(
        Report.status == "resolved"
    ).count()

    db.close()

    return {
        "total_reports": total_reports,
        "in_progress": in_progress,
        "resolved": resolved
    }