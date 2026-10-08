from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import engine, Base, SessionLocal
from models import User, CleaningTask, Report

from dotenv import load_dotenv
from pwdlib import PasswordHash
import jwt
import os
from datetime import datetime, timedelta, timezone



Base.metadata.create_all(bind=engine)


load_dotenv()

MAIN_ADMIN_ID = os.getenv("MAIN_ADMIN_ID")
MAIN_ADMIN_PASSWORD = os.getenv("MAIN_ADMIN_PASSWORD")
JWT_SECRET = os.getenv("JWT_SECRET")

if not MAIN_ADMIN_ID:
    raise RuntimeError("MAIN_ADMIN_ID is not configured")

if not MAIN_ADMIN_PASSWORD:
    raise RuntimeError("MAIN_ADMIN_PASSWORD is not configured")

if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET is not configured")



app = FastAPI(
    title="iC Clean Campus API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://thenitinkadiyan.github.io"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)



password_hash = PasswordHash.recommended()

security = HTTPBearer()

JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60 * 24



def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


class RegisterRequest(BaseModel):
    name: str
    gr_number: str
    password: str


class LoginRequest(BaseModel):
    login_id: str
    password: str


class AddUserRequest(BaseModel):
    name: str
    login_id: str
    password: str
    role: str
    area: str


class CleaningTaskRequest(BaseModel):
    title: str
    description: str = ""
    location: str
    area: str
    priority: str = "medium"
    staff_id: int


class ReportRequest(BaseModel):
    student_id: int
    problem: str
    location: str
    description: str = ""
    photo: str = ""
    area: str = ""

class ResetPasswordRequest(BaseModel):
    new_password: str



def create_access_token(
    user_id: int,
    login_id: str,
    role: str,
    name: str,
    area: str | None = None
):
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=JWT_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "login_id": login_id,
        "role": role,
        "name": name,
        "area": area,
        "exp": expire
    }

    return jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Session expired. Please login again."
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token."
        )

    user_id = payload.get("sub")
    role = payload.get("role")

    if not user_id or not role:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token."
        )

    if role == "main_admin":
        return {
            "id": 0,
            "login_id": payload.get("login_id"),
            "name": payload.get("name"),
            "role": "main_admin",
            "area": None
        }

    user = db.query(User).filter(
        User.id == int(user_id)
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User no longer exists."
        )

    return user


def require_main_admin(
    current_user=Depends(get_current_user)
):
    if current_user["role"] != "main_admin" if isinstance(current_user, dict) else current_user.role != "main_admin":
        raise HTTPException(
            status_code=403,
            detail="Main Admin access required."
        )

    return current_user

def get_user_role(current_user):
    if isinstance(current_user, dict):
        return current_user["role"]
    return current_user.role


def get_user_id(current_user):
    if isinstance(current_user, dict):
        return current_user["id"]
    return current_user.id


def get_user_area(current_user):
    if isinstance(current_user, dict):
        return current_user.get("area")
    return current_user.area

@app.get("/")
def home():
    return {
        "message": "iC Clean Campus Backend is Running",
        "status": "online"
    }


@app.post("/register")
def register_user(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    name = request.name.strip()
    gr_number = request.gr_number.strip()
    password = request.password

    if not name or not gr_number or not password:
        raise HTTPException(
            status_code=400,
            detail="Name, GR Number and Password are required."
        )

    if len(password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 6 characters."
        )

    existing_user = db.query(User).filter(
        User.gr_number == gr_number
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="GR Number already registered."
        )

    hashed_password = password_hash.hash(password)

    user = User(
        name=name,
        login_id=gr_number,
        gr_number=gr_number,
        password=hashed_password,
        role="student",
        area=None
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "Student registered successfully",
        "student_id": user.id
    }


@app.post("/login")
def login_user(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    login_id = request.login_id.strip()
    password = request.password

    if not login_id or not password:
        raise HTTPException(
            status_code=400,
            detail="ID and Password are required."
        )

    if (
        login_id == MAIN_ADMIN_ID
        and password == MAIN_ADMIN_PASSWORD
    ):
        token = create_access_token(
            user_id=0,
            login_id=MAIN_ADMIN_ID,
            role="main_admin",
            name="Main Admin",
            area=None
        )

        return {
            "message": "Login successful",
            "access_token": token,
            "token_type": "bearer",
            "user_id": 0,
            "name": "Main Admin",
            "login_id": MAIN_ADMIN_ID,
            "role": "main_admin",
            "gr_number": None,
            "area": None
        }


    user = db.query(User).filter(
        User.login_id == login_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid ID or Password."
        )

    try:
        password_correct = password_hash.verify(
            password,
            user.password
        )
    except Exception:
        password_correct = False

    if not password_correct:
        raise HTTPException(
            status_code=401,
            detail="Invalid ID or Password."
        )

    token = create_access_token(
        user_id=user.id,
        login_id=user.login_id,
        role=user.role,
        name=user.name,
        area=user.area
    )

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "name": user.name,
        "login_id": user.login_id,
        "gr_number": user.gr_number,
        "role": user.role,
        "area": user.area
    }


@app.get("/me")
def get_me(
    current_user=Depends(get_current_user)
):
    if isinstance(current_user, dict):
        return current_user

    return {
        "user_id": current_user.id,
        "name": current_user.name,
        "login_id": current_user.login_id,
        "gr_number": current_user.gr_number,
        "role": current_user.role,
        "area": current_user.area
    }


@app.post("/main-admin/add-user")
def add_user(
    request: AddUserRequest,
    current_user=Depends(require_main_admin),
    db: Session = Depends(get_db)
):
    name = request.name.strip()
    login_id = request.login_id.strip()
    password = request.password
    role = request.role.strip().lower()
    area = request.area.strip()

    if role not in ["admin", "staff"]:
        raise HTTPException(
            status_code=400,
            detail="Role must be admin or staff."
        )

    if not name or not login_id or not password or not area:
        raise HTTPException(
            status_code=400,
            detail="All fields are required."
        )

    if len(password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 6 characters."
        )

    existing_user = db.query(User).filter(
        User.login_id == login_id
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Login ID already registered."
        )

    hashed_password = password_hash.hash(password)

    user = User(
        name=name,
        login_id=login_id,
        gr_number=None,
        password=hashed_password,
        role=role,
        area=area
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": f"{role.capitalize()} created successfully",
        "user_id": user.id,
        "name": user.name,
        "login_id": user.login_id,
        "area": user.area,
        "role": user.role
    }


@app.get("/staff")
def get_staff(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    role = get_user_role(current_user)

    if role not in ["main_admin", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="Admin access required."
        )

    query = db.query(User).filter(
        User.role == "staff"
    )

    if role == "admin":
        admin_area = get_user_area(current_user)

        if not admin_area:
            raise HTTPException(
                status_code=403,
                detail="Admin area is not configured."
            )

        query = query.filter(
            User.area == admin_area
        )

    staff_members = query.order_by(
        User.id.desc()
    ).all()

    return [
        {
            "user_id": staff.id,
            "name": staff.name,
            "login_id": staff.login_id,
            "area": staff.area
        }
        for staff in staff_members
    ]



@app.post("/cleaning-tasks")
def create_cleaning_task(
    request: CleaningTaskRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    role = (
        current_user["role"]
        if isinstance(current_user, dict)
        else current_user.role
    )

    if role not in ["main_admin", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="Admin access required."
        )

    staff = db.query(User).filter(
        User.id == request.staff_id,
        User.role == "staff"
    ).first()
        if role == "admin":
        admin_area = get_user_area(current_user)

        if not admin_area:
            raise HTTPException(
                status_code=403,
                detail="Admin area is not configured."
            )

        if staff.area != admin_area:
            raise HTTPException(
                status_code=403,
                detail="You can only assign tasks to staff from your area."
            )

        if request.area.strip() != admin_area:
            raise HTTPException(
                status_code=403,
                detail="You can only create tasks for your assigned area."
            )
    if not staff:
        raise HTTPException(
            status_code=404,
            detail="Staff member not found."
        )

    task = CleaningTask(
        title=request.title.strip(),
        description=request.description.strip(),
        location=request.location.strip(),
        area=request.area.strip(),
        priority=request.priority.strip().lower(),
        staff_id=request.staff_id,
        status="assigned"
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return {
        "message": "Cleaning task assigned successfully",
        "task_id": task.id,
        "staff_id": task.staff_id,
        "area": task.area,
        "status": task.status
    }

==

@app.get("/cleaning-tasks/staff/{staff_id}")
def get_staff_task(
    staff_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    role = (
        current_user["role"]
        if isinstance(current_user, dict)
        else current_user.role
    )

    current_id = (
        current_user["id"]
        if isinstance(current_user, dict)
        else current_user.id
    )

    if role == "staff" and current_id != staff_id:
        raise HTTPException(
            status_code=403,
            detail="You can only access your own tasks."
        )

    if role not in ["main_admin", "admin", "staff"]:
        raise HTTPException(
            status_code=403,
            detail="Access denied."
        )

    task = db.query(CleaningTask).filter(
        CleaningTask.staff_id == staff_id,
        CleaningTask.status == "assigned"
    ).first()

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


@app.post("/reports")
def create_report(
    request: ReportRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_id = (
        current_user["id"]
        if isinstance(current_user, dict)
        else current_user.id
    )

    role = (
        current_user["role"]
        if isinstance(current_user, dict)
        else current_user.role
    )

    if role == "student" and current_id != request.student_id:
        raise HTTPException(
            status_code=403,
            detail="You can only submit reports for yourself."
        )

    report = Report(
        student_id=request.student_id,
        problem=request.problem.strip(),
        location=request.location.strip(),
        description=request.description.strip(),
        photo=request.photo,
        area=request.area.strip(),
        status="submitted"
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return {
        "message": "Report submitted successfully",
        "report_id": report.id,
        "status": report.status
    }


@app.get("/reports")
def get_reports(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    role = (
        current_user["role"]
        if isinstance(current_user, dict)
        else current_user.role
    )

    reports_query = db.query(Report)

    if role == "student":
        student_id = (
            current_user["id"]
            if isinstance(current_user, dict)
            else current_user.id
        )

        reports_query = reports_query.filter(
            Report.student_id == student_id
        )
    elif role == "admin":
        admin_area = get_user_area(current_user)

        if not admin_area:
            raise HTTPException(
                status_code=403,
                detail="Admin area is not configured."
            )

        reports_query = reports_query.filter(
            Report.area == admin_area
        )

    elif role == "staff":
        current_staff_id = get_user_id(current_user)

        reports_query = reports_query.filter(
            Report.assigned_staff_id == current_staff_id
        )

    elif role != "main_admin":
        raise HTTPException(
            status_code=403,
            detail="Access denied."
        )
        raise HTTPException(
            status_code=403,
            detail="Access denied."
        )

    reports = reports_query.order_by(
        Report.id.desc()
    ).all()

    return [
        {
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
        }
        for report in reports
    ]


@app.get("/admin/stats")
def get_admin_stats(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    role = get_user_role(current_user)

    if role not in ["main_admin", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="Admin access required."
        )

    query = db.query(Report)
    if role == "admin":
        admin_area = get_user_area(current_user)

        if not admin_area:
            raise HTTPException(
                status_code=403,
                detail="Admin area is not configured."
            )

        query = query.filter(
            Report.area == admin_area
        )

    total_reports = query.count()

    in_progress = query.filter(
        Report.status.in_([
            "assigned",
            "cleaning",
            "in_progress"
        ])
    ).count()

    resolved = query.filter(
        Report.status == "resolved"
    ).count()

    pending = query.filter(
        Report.status.notin_([
            "resolved",
            "assigned",
            "cleaning",
            "in_progress"
        ])
    ).count()

    return {
        "total_reports": total_reports,
        "in_progress": in_progress,
        "resolved": resolved,
        "pending": pending
    }


@app.get("/students/leaderboard")
def get_student_leaderboard(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    students = db.query(User).filter(
        User.role == "student"
    ).order_by(
        User.points.desc()
    ).all()

    return [
        {
            "id": student.id,
            "name": student.name,
            "gr_number": student.gr_number,
            "points": student.points
        }
        for student in students
    ]
@app.get("/main-admin/overview")
def get_main_admin_overview(
    current_user=Depends(require_main_admin),
    db: Session = Depends(get_db)
):
    students = db.query(User).filter(
        User.role == "student"
    ).order_by(User.id.desc()).all()

    admins = db.query(User).filter(
        User.role == "admin"
    ).order_by(User.id.desc()).all()

    staff_members = db.query(User).filter(
        User.role == "staff"
    ).order_by(User.id.desc()).all()

    total_reports = db.query(Report).count()

    return {
        "counts": {
            "students": len(students),
            "admins": len(admins),
            "staff": len(staff_members),
            "reports": total_reports
        },

        "students": [
            {
                "id": user.id,
                "name": user.name,
                "login_id": user.login_id,
                "gr_number": user.gr_number,
                "role": user.role,
                "area": user.area
            }
            for user in students
        ],

        "admins": [
            {
                "id": user.id,
                "name": user.name,
                "login_id": user.login_id,
                "role": user.role,
                "area": user.area
            }
            for user in admins
        ],

        "staff": [
            {
                "id": user.id,
                "name": user.name,
                "login_id": user.login_id,
                "role": user.role,
                "area": user.area
            }
            for user in staff_members
        ]
    }


@app.post("/main-admin/users/{user_id}/reset-password")
def reset_user_password(
    user_id: int,
    request: ResetPasswordRequest,
    current_user=Depends(require_main_admin),
    db: Session = Depends(get_db)
):
    new_password = request.new_password

    if not new_password:
        raise HTTPException(
            status_code=400,
            detail="New password is required."
        )

    if len(new_password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 6 characters."
        )

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    if user.role not in ["student", "admin", "staff"]:
        raise HTTPException(
            status_code=400,
            detail="Password reset is not available for this account."
        )

    user.password = password_hash.hash(new_password)

    db.commit()

    return {
        "message": "Password reset successfully",
        "user_id": user.id
    }
@app.get("/main-admin/full-overview")
def get_main_admin_full_overview(
    current_user=Depends(require_main_admin),
    db: Session = Depends(get_db)
):
    students = db.query(User).filter(
        User.role == "student"
    ).order_by(User.id.desc()).all()

    admins = db.query(User).filter(
        User.role == "admin"
    ).order_by(User.id.desc()).all()

    staff_members = db.query(User).filter(
        User.role == "staff"
    ).order_by(User.id.desc()).all()

    reports = db.query(Report).order_by(
        Report.id.desc()
    ).all()

    return {
        "counts": {
            "students": len(students),
            "admins": len(admins),
            "staff": len(staff_members),
            "reports": len(reports)
        },

        "students": [
            {
                "id": user.id,
                "name": user.name,
                "login_id": user.login_id,
                "gr_number": user.gr_number,
                "role": user.role,
                "area": user.area
            }
            for user in students
        ],

        "admins": [
            {
                "id": user.id,
                "name": user.name,
                "login_id": user.login_id,
                "role": user.role,
                "area": user.area
            }
            for user in admins
        ],

        "staff": [
            {
                "id": user.id,
                "name": user.name,
                "login_id": user.login_id,
                "role": user.role,
                "area": user.area
            }
            for user in staff_members
        ],

        "reports": [
            {
                "id": report.id,
                "student_id": report.student_id,
                "problem": report.problem,
                "location": report.location,
                "description": report.description,
                "area": report.area,
                "status": report.status,
                "assigned_staff_id": report.assigned_staff_id,
                "pending_reason": report.pending_reason
            }
            for report in reports
        ]
    }