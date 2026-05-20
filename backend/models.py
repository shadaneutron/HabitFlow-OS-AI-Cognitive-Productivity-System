from sqlalchemy import Boolean, Column, Integer, String, ForeignKey, Date, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from database import Base
import enum
from datetime import datetime


class TaskType(str, enum.Enum):
    quiz = "quiz"
    assignment = "assignment"
    personal = "personal"
    habit = "habit"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    user_name = Column(String, default="User")

    courses = relationship("Course", back_populates="owner")
    tasks = relationship("Task", back_populates="owner")
    notes = relationship("Note", back_populates="owner")
    time_blocks = relationship("TimeBlock", back_populates="owner")
    
    habits = relationship("Habit", back_populates="owner", cascade="all, delete-orphan")
    matrix_tasks = relationship("MatrixTask", back_populates="owner", cascade="all, delete-orphan")
    pomodoro_sessions = relationship("PomodoroSession", back_populates="owner", cascade="all, delete-orphan")
    inbox_items = relationship("InboxItem", back_populates="owner", cascade="all, delete-orphan")
    brain_dumps = relationship("BrainDump", back_populates="owner", cascade="all, delete-orphan")
    memory = relationship("UserMemory", back_populates="owner", uselist=False, cascade="all, delete-orphan")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    course_name = Column(String, nullable=False)
    course_code = Column(String, nullable=False)

    owner = relationship("User", back_populates="courses")
    materials = relationship("Material", back_populates="course")
    tasks = relationship("Task", back_populates="course")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    title = Column(String, nullable=False)

    task_type = Column(Enum(TaskType), default=TaskType.personal)
    due_date = Column(Date, nullable=True)
    status = Column(String, default="todo")  # todo, in_progress, done

    owner = relationship("User", back_populates="tasks")
    course = relationship("Course", back_populates="tasks")


class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"))
    file_name = Column(String, nullable=False)
    file_url = Column(String, nullable=False)

    course = relationship("Course", back_populates="materials")


class Note(Base):
    """Second Brain / Zettelkasten note with backlinking support."""
    __tablename__ = "notes"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    content = Column(Text, default="")
    tags = Column(String, default="")  # JSON-encoded list of tag strings
    embedding = Column(Text, nullable=True)  # JSON-encoded list of floats for semantic search
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="notes")


class TimeBlock(Base):
    """Hourly time-block entry for daily planning."""
    __tablename__ = "time_blocks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, nullable=False)
    hour = Column(Integer, nullable=False)  # 0-23
    task_title = Column(String, nullable=False)
    color = Column(String, default="#2563EB")
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)

    owner = relationship("User", back_populates="time_blocks")


# ── New Models for Cloud Sync and AI Memory Layer ──

class Habit(Base):
    __tablename__ = "habits"

    id = Column(String, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    category = Column(String, default="study")
    completed_dates = Column(Text, default="[]")  # JSON list
    created_at = Column(String, nullable=True)

    owner = relationship("User", back_populates="habits")


class MatrixTask(Base):
    __tablename__ = "matrix_tasks"

    id = Column(String, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    quadrant = Column(String, default="q1")
    done = Column(Boolean, default=False)
    created_at = Column(String, nullable=True)

    owner = relationship("User", back_populates="matrix_tasks")


class PomodoroSession(Base):
    __tablename__ = "pomodoro_sessions"

    id = Column(String, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    label = Column(String, nullable=True)
    duration = Column(Integer, default=25)
    completed_at = Column(String, nullable=False)
    type = Column(String, default="work")

    owner = relationship("User", back_populates="pomodoro_sessions")


class InboxItem(Base):
    __tablename__ = "inbox_items"

    id = Column(String, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    created_at = Column(String, nullable=False)
    processed = Column(Boolean, default=False)

    owner = relationship("User", back_populates="inbox_items")


class BrainDump(Base):
    __tablename__ = "brain_dumps"

    id = Column(String, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    original_text = Column(Text, nullable=False)
    calming_response = Column(Text, nullable=False)
    extracted_tasks = Column(Text, default="[]")  # JSON list of strings
    focus_suggestion = Column(Text, nullable=False)
    is_archived = Column(Boolean, default=False)
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="brain_dumps")


class UserMemory(Base):
    __tablename__ = "user_memories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    context_summary = Column(Text, default="{}")  # JSON string
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="memory")
