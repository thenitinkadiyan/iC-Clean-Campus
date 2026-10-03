from sqlalchemy import Column, Integer, String
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    login_id = Column(String, unique=True, nullable=True, index=True)
    gr_number = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    role = Column(String, default="student", nullable=False)
    area = Column(String, nullable=True)


class CleaningTask(Base):
    __tablename__ = "cleaning_tasks"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    location = Column(String, nullable=False)
    area = Column(String, nullable=True)

    priority = Column(String, default="medium", nullable=False)

    staff_id = Column(Integer, nullable=True)

    status = Column(String, default="assigned", nullable=False)

    before_photo = Column(String, nullable=True)
    after_photo = Column(String, nullable=True)