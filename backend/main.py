from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
import json
import logging
import uuid
from datetime import date, datetime

from database import engine, Base, get_db
import models
from services import ai_service
from utils import auth as auth_utils

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="HabitFlow OS API")

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# ──────────── Schemas ────────────

class RegisterRequest(BaseModel):
    email: str
    password: str
    user_name: str

class LoginRequest(BaseModel):
    email: str
    password: str

class OnboardingRequest(BaseModel):
    user_name: Optional[str] = None
    primary_focus: str
    current_struggle: str
    preferred_style: str

class NoteCreate(BaseModel):
    id: str
    title: str
    content: str = ""
    tags: list[str] = []

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[list[str]] = None

class NoteResponse(BaseModel):
    id: str
    title: str
    content: str
    tags: list[str]
    created_at: datetime
    updated_at: datetime

class TimeBlockCreate(BaseModel):
    date: date
    hour: int
    task_title: str
    color: str = "#2563EB"
    task_id: Optional[str] = None

class BrainDumpRequest(BaseModel):
    text: str

class DailyReflectionRequest(BaseModel):
    habits: list[str] = []
    tasks: list[str] = []
    focus_time_min: int = 0

class TaskBreakdownRequest(BaseModel):
    title: str

class FocusRescueRequest(BaseModel):
    q1_tasks: list[str] = []

class SemanticSearchRequest(BaseModel):
    query: str

class TinyModeNextRequest(BaseModel):
    tasks: list[dict]
    completed_task_title: str

# Sync schemas
class SyncHabit(BaseModel):
    id: str
    name: str
    category: str
    completedDates: list[str]
    createdAt: Optional[str] = None

class SyncMatrixTask(BaseModel):
    id: str
    title: str
    quadrant: str
    done: bool
    createdAt: Optional[str] = None

class SyncPomodoroSession(BaseModel):
    id: str
    label: Optional[str] = None
    duration: int
    completedAt: str
    type: str

class SyncInboxItem(BaseModel):
    id: str
    content: str
    createdAt: str
    processed: bool

class SyncPayload(BaseModel):
    habits: list[SyncHabit]
    matrixTasks: list[SyncMatrixTask]
    pomodoroSessions: list[SyncPomodoroSession]
    inboxItems: list[SyncInboxItem]


# ──────────── Helpers ────────────

def note_to_response(note: models.Note) -> dict:
    tags = json.loads(note.tags) if note.tags else []
    return {
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "tags": tags,
        "created_at": note.created_at,
        "updated_at": note.updated_at,
    }


def get_current_user_optional(request: Request, db: Session = Depends(get_db)) -> models.User:
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        user_id_str = auth_utils.verify_access_token(token)
        if user_id_str:
            try:
                user_id = int(user_id_str)
                user = db.query(models.User).filter(models.User.id == user_id).first()
                if user:
                    return user
            except ValueError:
                pass
    
    # Fallback to guest user (ID = 1)
    guest = db.query(models.User).filter(models.User.id == 1).first()
    if not guest:
        guest = models.User(id=1, email="guest@habitflow.local", hashed_password="guest", user_name="Guest")
        db.add(guest)
        db.commit()
        db.refresh(guest)
        
        # Ensure memory exists for guest
        if not db.query(models.UserMemory).filter(models.UserMemory.user_id == 1).first():
            db.add(models.UserMemory(user_id=1, context_summary="{}"))
            db.commit()
    return guest


# ──────────── Root ────────────

@app.get("/")
def read_root():
    return {"status": "HabitFlow API is running"}


# ──────────── Auth Endpoints ────────────

@app.post("/api/auth/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = auth_utils.hash_password(payload.password)
    user = models.User(
        email=payload.email,
        hashed_password=hashed,
        user_name=payload.user_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create empty user memory
    memory = models.UserMemory(user_id=user.id, context_summary="{}")
    db.add(memory)
    db.commit()
    
    token = auth_utils.create_access_token(user.id)
    return {"token": token, "user": {"email": user.email, "name": user.user_name}}


@app.post("/api/auth/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not auth_utils.verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    token = auth_utils.create_access_token(user.id)
    return {"token": token, "user": {"email": user.email, "name": user.user_name}}


@app.post("/api/onboarding")
def onboarding(payload: OnboardingRequest, request: Request, db: Session = Depends(get_db)):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth_header.split(" ")[1]
    user_id_str = auth_utils.verify_access_token(token)
    if not user_id_str:
        raise HTTPException(status_code=401, detail="Token invalid or expired")
    
    user = db.query(models.User).filter(models.User.id == int(user_id_str)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    if payload.user_name and payload.user_name.strip():
        user.user_name = payload.user_name.strip()
        
    memory = db.query(models.UserMemory).filter(models.UserMemory.user_id == user.id).first()
    if not memory:
        memory = models.UserMemory(user_id=user.id, context_summary="{}")
        db.add(memory)
        
    # Serialize the context summary based on the new onboarding answers
    context_data = {
        "primary_focus": payload.primary_focus,
        "current_struggle": payload.current_struggle,
        "preferred_style": payload.preferred_style
    }
    memory.context_summary = json.dumps(context_data)
    db.commit()
    
    return {"message": "Onboarding completed successfully", "user_name": user.user_name}


@app.get("/api/auth/me")
def get_me(request: Request, db: Session = Depends(get_db)):
    # Specific verification for /me endpoint to force 401 if token is expired/invalid
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth_header.split(" ")[1]
    user_id_str = auth_utils.verify_access_token(token)
    if not user_id_str:
        raise HTTPException(status_code=401, detail="Token invalid or expired")
    
    user = db.query(models.User).filter(models.User.id == int(user_id_str)).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    return {"email": user.email, "name": user.user_name}


# ──────────── Cloud Sync ────────────

@app.get("/api/sync")
def get_sync(current_user: models.User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    habits = db.query(models.Habit).filter(models.Habit.user_id == current_user.id).all()
    matrix_tasks = db.query(models.MatrixTask).filter(models.MatrixTask.user_id == current_user.id).all()
    pomodoros = db.query(models.PomodoroSession).filter(models.PomodoroSession.user_id == current_user.id).all()
    inbox = db.query(models.InboxItem).filter(models.InboxItem.user_id == current_user.id).all()
    
    # Fetch User memory description
    memory_obj = db.query(models.UserMemory).filter(models.UserMemory.user_id == current_user.id).first()
    memory_dict = json.loads(memory_obj.context_summary) if (memory_obj and memory_obj.context_summary) else {}
    
    return {
        "habits": [
            {
                "id": h.id,
                "name": h.name,
                "category": h.category,
                "completedDates": json.loads(h.completed_dates),
                "createdAt": h.created_at
            } for h in habits
        ],
        "matrixTasks": [
            {
                "id": t.id,
                "title": t.title,
                "quadrant": t.quadrant,
                "done": t.done,
                "createdAt": t.created_at
            } for t in matrix_tasks
        ],
        "pomodoroSessions": [
            {
                "id": p.id,
                "label": p.label,
                "duration": p.duration,
                "completedAt": p.completed_at,
                "type": p.type
            } for p in pomodoros
        ],
        "inboxItems": [
            {
                "id": i.id,
                "content": i.content,
                "createdAt": i.created_at,
                "processed": i.processed
            } for i in inbox
        ],
        "userMemory": memory_dict
    }


@app.post("/api/sync")
def post_sync(payload: SyncPayload, current_user: models.User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    # Habits
    db.query(models.Habit).filter(models.Habit.user_id == current_user.id).delete()
    for h in payload.habits:
        db.add(models.Habit(
            id=h.id,
            user_id=current_user.id,
            name=h.name,
            category=h.category,
            completed_dates=json.dumps(h.completedDates),
            created_at=h.createdAt
        ))
        
    # Matrix Tasks
    db.query(models.MatrixTask).filter(models.MatrixTask.user_id == current_user.id).delete()
    for t in payload.matrixTasks:
        db.add(models.MatrixTask(
            id=t.id,
            user_id=current_user.id,
            title=t.title,
            quadrant=t.quadrant,
            done=t.done,
            created_at=t.createdAt
        ))
        
    # Pomodoro Sessions
    db.query(models.PomodoroSession).filter(models.PomodoroSession.user_id == current_user.id).delete()
    for p in payload.pomodoroSessions:
        db.add(models.PomodoroSession(
            id=p.id,
            user_id=current_user.id,
            label=p.label,
            duration=p.duration,
            completed_at=p.completed_at,
            type=p.type
        ))
        
    # Inbox Items
    db.query(models.InboxItem).filter(models.InboxItem.user_id == current_user.id).delete()
    for i in payload.inboxItems:
        db.add(models.InboxItem(
            id=i.id,
            user_id=current_user.id,
            content=i.content,
            created_at=i.createdAt,
            processed=i.processed
        ))
        
    db.commit()
    return {"status": "success"}


# ──────────── Notes CRUD ────────────

@app.get("/api/notes")
def list_notes(current_user: models.User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    notes = db.query(models.Note).filter(models.Note.user_id == current_user.id).order_by(models.Note.updated_at.desc()).all()
    return [note_to_response(n) for n in notes]


@app.post("/api/notes", status_code=201)
def create_note(payload: NoteCreate, current_user: models.User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    note_content_for_embedding = f"{payload.title} {payload.content}"
    embedding = ai_service.get_embedding(note_content_for_embedding)
    embedding_json = json.dumps(embedding) if embedding else None

    note = models.Note(
        id=payload.id,
        title=payload.title,
        content=payload.content,
        tags=json.dumps(payload.tags),
        embedding=embedding_json,
        user_id=current_user.id,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note_to_response(note)


@app.get("/api/notes/{note_id}")
def get_note(note_id: str, current_user: models.User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id, models.Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note_to_response(note)


@app.put("/api/notes/{note_id}")
def update_note(note_id: str, payload: NoteUpdate, current_user: models.User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id, models.Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    modified = False
    if payload.title is not None:
        note.title = payload.title
        modified = True
    if payload.content is not None:
        note.content = payload.content
        modified = True
    if payload.tags is not None:
        note.tags = json.dumps(payload.tags)

    if modified:
        note_content_for_embedding = f"{note.title} {note.content}"
        embedding = ai_service.get_embedding(note_content_for_embedding)
        note.embedding = json.dumps(embedding) if embedding else None

    db.commit()
    db.refresh(note)
    return note_to_response(note)


@app.delete("/api/notes/{note_id}")
def delete_note(note_id: str, current_user: models.User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id, models.Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
    return {"status": "deleted"}


@app.get("/api/notes/{note_id}/backlinks")
def get_backlinks(note_id: str, current_user: models.User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id, models.Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    pattern = f"[[{note.title}]]"
    backlinks = db.query(models.Note).filter(
        models.Note.id != note_id,
        models.Note.user_id == current_user.id,
        models.Note.content.contains(pattern)
    ).all()
    return [note_to_response(n) for n in backlinks]


# ──────────── Brain Dump AI ────────────

@app.post("/api/brain-dump")
def process_brain_dump(payload: BrainDumpRequest, current_user: models.User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text is required")
    
    result = ai_service.process_brain_dump(payload.text)
    
    # Save brain dump to DB
    dump_id = "bd-" + str(uuid.uuid4())[:8]
    brain_dump = models.BrainDump(
        id=dump_id,
        user_id=current_user.id,
        original_text=payload.text,
        calming_response=result.get("calming_response", ""),
        extracted_tasks=json.dumps(result.get("extracted_tasks", [])),
        focus_suggestion=result.get("focus_suggestion", "")
    )
    db.add(brain_dump)
    
    # Retrieve user memory context
    memory_obj = db.query(models.UserMemory).filter(models.UserMemory.user_id == current_user.id).first()
    if not memory_obj:
        memory_obj = models.UserMemory(user_id=current_user.id, context_summary="{}")
        db.add(memory_obj)
        db.commit()
        db.refresh(memory_obj)
        
    try:
        existing_mem = json.loads(memory_obj.context_summary) if memory_obj.context_summary else {}
    except Exception:
        existing_mem = {}
        
    # Update user memory
    updated_mem = ai_service.update_user_memory(existing_mem, payload.text)
    memory_obj.context_summary = json.dumps(updated_mem)
    
    db.commit()
    
    return {
        "id": dump_id,
        "calming_response": brain_dump.calming_response,
        "extracted_tasks": result.get("extracted_tasks", []),
        "focus_suggestion": brain_dump.focus_suggestion
    }


@app.get("/api/brain-dumps")
def list_brain_dumps(current_user: models.User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    dumps = db.query(models.BrainDump).filter(
        models.BrainDump.user_id == current_user.id
    ).order_by(
        models.BrainDump.is_pinned.desc(),
        models.BrainDump.created_at.desc()
    ).all()
    return [
        {
            "id": d.id,
            "original_text": d.original_text,
            "calming_response": d.calming_response,
            "extracted_tasks": json.loads(d.extracted_tasks) if d.extracted_tasks else [],
            "focus_suggestion": d.focus_suggestion,
            "is_archived": d.is_archived,
            "is_pinned": d.is_pinned,
            "created_at": d.created_at.isoformat() if hasattr(d.created_at, 'isoformat') else str(d.created_at)
        } for d in dumps
    ]


class BrainDumpUpdate(BaseModel):
    is_archived: Optional[bool] = None
    is_pinned: Optional[bool] = None


@app.put("/api/brain-dumps/{dump_id}")
def update_brain_dump(dump_id: str, payload: BrainDumpUpdate, current_user: models.User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    dump = db.query(models.BrainDump).filter(models.BrainDump.id == dump_id, models.BrainDump.user_id == current_user.id).first()
    if not dump:
        raise HTTPException(status_code=404, detail="Brain dump not found")
    
    if payload.is_archived is not None:
        dump.is_archived = payload.is_archived
    if payload.is_pinned is not None:
        dump.is_pinned = payload.is_pinned
        
    db.commit()
    db.refresh(dump)
    return {
        "id": dump.id,
        "is_archived": dump.is_archived,
        "is_pinned": dump.is_pinned
    }


@app.delete("/api/brain-dumps/{dump_id}")
def delete_brain_dump(dump_id: str, current_user: models.User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    dump = db.query(models.BrainDump).filter(models.BrainDump.id == dump_id, models.BrainDump.user_id == current_user.id).first()
    if not dump:
        raise HTTPException(status_code=404, detail="Brain dump not found")
    db.delete(dump)
    db.commit()
    return {"status": "deleted"}


class BrainDumpRestore(BaseModel):
    id: str
    original_text: str
    calming_response: str
    extracted_tasks: list[str] = []
    focus_suggestion: str
    created_at: str
    is_archived: bool = False
    is_pinned: bool = False


@app.post("/api/brain-dumps/restore")
def restore_brain_dump(payload: BrainDumpRestore, current_user: models.User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    # Recreate the brain dump exactly as it was
    created_at_str = payload.created_at
    try:
        if created_at_str.endswith("Z"):
            created_at_str = created_at_str[:-1] + "+00:00"
        dt = datetime.fromisoformat(created_at_str)
    except Exception:
        dt = datetime.utcnow()

    dump = models.BrainDump(
        id=payload.id,
        user_id=current_user.id,
        original_text=payload.original_text,
        calming_response=payload.calming_response,
        extracted_tasks=json.dumps(payload.extracted_tasks),
        focus_suggestion=payload.focus_suggestion,
        created_at=dt,
        is_archived=payload.is_archived,
        is_pinned=payload.is_pinned
    )
    db.add(dump)
    db.commit()
    return {"status": "restored"}


@app.post("/api/daily-reflection")
def generate_daily_reflection(payload: DailyReflectionRequest, current_user: models.User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    memory_obj = db.query(models.UserMemory).filter(models.UserMemory.user_id == current_user.id).first()
    memory_dict = json.loads(memory_obj.context_summary) if (memory_obj and memory_obj.context_summary) else {}
    
    reflection = ai_service.generate_daily_reflection(
        habits=payload.habits,
        tasks=payload.tasks,
        focus_time_min=payload.focus_time_min,
        user_memory=memory_dict
    )
    return {"reflection": reflection}


@app.post("/api/task-breakdown")
def generate_task_breakdown(payload: TaskBreakdownRequest, current_user: models.User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    if not payload.title or not payload.title.strip():
        raise HTTPException(status_code=400, detail="Title is required")
    
    memory_obj = db.query(models.UserMemory).filter(models.UserMemory.user_id == current_user.id).first()
    memory_dict = json.loads(memory_obj.context_summary) if (memory_obj and memory_obj.context_summary) else {}

    result = ai_service.generate_task_breakdown(payload.title, user_memory=memory_dict)
    return result


@app.post("/api/focus-rescue")
def generate_focus_rescue(payload: FocusRescueRequest, current_user: models.User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    memory_obj = db.query(models.UserMemory).filter(models.UserMemory.user_id == current_user.id).first()
    memory_dict = json.loads(memory_obj.context_summary) if (memory_obj and memory_obj.context_summary) else {}
    
    result = ai_service.generate_focus_rescue(payload.q1_tasks, user_memory=memory_dict)
    return result


@app.post("/api/notes/search")
def search_notes(payload: SemanticSearchRequest, current_user: models.User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    query = payload.query.strip()
    if not query:
        notes = db.query(models.Note).filter(models.Note.user_id == current_user.id).order_by(models.Note.updated_at.desc()).all()
        return [note_to_response(n) for n in notes]

    query_emb = ai_service.get_embedding(query)
    if not query_emb:
        notes = db.query(models.Note).filter(
            models.Note.user_id == current_user.id,
            models.Note.title.contains(query) | models.Note.content.contains(query)
        ).all()
        return [note_to_response(n) for n in notes]

    notes = db.query(models.Note).filter(models.Note.user_id == current_user.id).all()
    results = []
    for note in notes:
        similarity = 0.0
        if note.embedding:
            try:
                note_emb = json.loads(note.embedding)
                similarity = ai_service.calculate_similarity(query_emb, note_emb)
            except Exception as e:
                pass
        
        keyword_match = 0.0
        if query.lower() in note.title.lower():
            keyword_match += 0.2
        if query.lower() in note.content.lower():
            keyword_match += 0.1
            
        score = similarity + keyword_match
        results.append((note, score))

    results.sort(key=lambda x: x[1], reverse=True)
    return [note_to_response(r[0]) for r in results]


# ──────────── Dynamic Tiny Mode ────────────

@app.post("/api/tiny-mode/next")
def tiny_mode_next(payload: TinyModeNextRequest, current_user: models.User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    memory_obj = db.query(models.UserMemory).filter(models.UserMemory.user_id == current_user.id).first()
    memory_dict = json.loads(memory_obj.context_summary) if (memory_obj and memory_obj.context_summary) else {}
    
    result = ai_service.suggest_next_tiny_step(
        tasks=payload.tasks,
        completed_task_title=payload.completed_task_title,
        user_memory=memory_dict
    )
    return result


@app.get("/api/cognitive-context")
def get_cognitive_context(current_user: models.User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    # Retrieve user memory context
    memory_obj = db.query(models.UserMemory).filter(models.UserMemory.user_id == current_user.id).first()
    memory_dict = {}
    if memory_obj and memory_obj.context_summary:
        try:
            memory_dict = json.loads(memory_obj.context_summary)
        except Exception:
            pass
            
    # Retrieve matrix tasks
    q1_count = db.query(models.MatrixTask).filter(
        models.MatrixTask.user_id == current_user.id,
        models.MatrixTask.quadrant == "q1",
        models.MatrixTask.done == False
    ).count()
    
    q2_count = db.query(models.MatrixTask).filter(
        models.MatrixTask.user_id == current_user.id,
        models.MatrixTask.quadrant == "q2",
        models.MatrixTask.done == False
    ).count()
    
    current_focus = memory_dict.get("current_focus", memory_dict.get("primary_focus", []))
    if isinstance(current_focus, str):
        current_focus = [current_focus] if current_focus else []
    elif not isinstance(current_focus, list):
        current_focus = []
        
    stressors = memory_dict.get("stressors", memory_dict.get("current_struggle", []))
    if isinstance(stressors, str):
        stressors = [stressors] if stressors else []
    elif not isinstance(stressors, list):
        stressors = []
        
    # Compute pressure and recommended mode
    total_stressors = len(stressors)
    total_urgent = q1_count
    
    if total_stressors >= 2 or total_urgent >= 2:
        pressure = "high"
        recommended_mode = "tiny"
    elif total_stressors >= 1 or total_urgent >= 1:
        pressure = "medium"
        recommended_mode = "focus"
    else:
        pressure = "low"
        recommended_mode = "reflect" if q2_count == 0 else "focus"
        
    return {
        "active_focus": current_focus,
        "active_stressors": stressors,
        "current_pressure": pressure,
        "recommended_mode": recommended_mode,
        "academic_career_phase": memory_dict.get("academic_career_phase", memory_dict.get("preferred_style", ""))
    }


@app.get("/api/matrix/recommendations")
def get_matrix_recommendations(current_user: models.User = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    # Retrieve all uncompleted matrix tasks
    tasks = db.query(models.MatrixTask).filter(
        models.MatrixTask.user_id == current_user.id,
        models.MatrixTask.done == False
    ).all()
    
    tasks_list = [
        {
            "id": t.id,
            "title": t.title,
            "quadrant": t.quadrant
        } for t in tasks
    ]
    
    # Retrieve user memory context
    memory_obj = db.query(models.UserMemory).filter(models.UserMemory.user_id == current_user.id).first()
    memory_dict = {}
    if memory_obj and memory_obj.context_summary:
        try:
            memory_dict = json.loads(memory_obj.context_summary)
        except Exception:
            pass
            
    # Call AI service
    recommendation = ai_service.generate_matrix_recommendation(tasks_list, user_memory=memory_dict)
    return recommendation

