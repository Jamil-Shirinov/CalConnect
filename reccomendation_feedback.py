from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker, Session

# 1. Foolproof Database Path
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "mentors.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Updated for SQLAlchemy 2.0
Base = declarative_base()

class MentorModel(Base):
    __tablename__ = "mentors"
    id = Column(String, primary_key=True, index=True)
    likes = Column(Integer, default=0)
    reviews = Column(Integer, default=0)
    skips = Column(Integer, default=0)
    past_bookings = Column(Integer, default=0)

Base.metadata.create_all(bind=engine)

# 2. Modern Lifespan Startup Logic
@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    if db.query(MentorModel).count() == 0:
        db.add_all([
            MentorModel(id="mentor_alice", likes=15, reviews=8, skips=1, past_bookings=12),
            MentorModel(id="mentor_bob", likes=5, reviews=2, skips=4, past_bookings=3)
        ])
        db.commit()
    db.close()
    yield

# 3. Initialize FastAPI App
app = FastAPI(title="CalConnect Recommendation API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

weights = {
    'likes': 0.30,
    'reviews': 0.30,
    'past bookings': 0.40,
    'skips': 0.0
}

class FeedbackPayload(BaseModel):
    mentor_id: str
    action: str

def calculate_match_score(mentor: MentorModel) -> float:
    likes_score = min(1.0, mentor.likes / 20.0)
    reviews_score = min(1.0, mentor.reviews / 10.0)
    net_bookings = max(0, mentor.past_bookings - mentor.skips)
    bookings_score = min(1.0, net_bookings / 15.0)
    
    return (
        likes_score * weights['likes'] +
        reviews_score * weights['reviews'] +
        bookings_score * weights['past bookings']
    )

@app.get("/recommend")
def get_recommendations(top_n: int = 2, db: Session = Depends(get_db)):
    mentors = db.query(MentorModel).all()
    match_scores = {m.id: calculate_match_score(m) for m in mentors}
    sorted_mentors = sorted(match_scores.items(), key=lambda x: x[1], reverse=True)[:top_n]
    return {"status": "success", "recommendations": [{"mentor_id": m, "score": s} for m, s in sorted_mentors]}

@app.post("/feedback")
def receive_feedback(payload: FeedbackPayload, db: Session = Depends(get_db)):
    mentor = db.query(MentorModel).filter(MentorModel.id == payload.mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Mentor not found")
    
    if payload.action == "book":
        mentor.past_bookings += 1
        weights['past bookings'] = min(0.60, weights['past bookings'] + 0.05)
        remaining = 1.0 - weights['past bookings']
        other_keys = [k for k in weights if k != 'past bookings']
        other_sum = sum(weights[k] for k in other_keys)
        if other_sum > 0:
            factor = remaining / other_sum
            for k in other_keys:
                weights[k] *= factor
    elif payload.action == "skip":
        mentor.skips += 1

    db.commit()
    db.refresh(mentor)
    return {
        "status": "feedback_recorded", 
        "updated_weights": weights, 
        "mentor_stats": {
            "likes": mentor.likes,
            "reviews": mentor.reviews,
            "skips": mentor.skips,
            "past bookings": mentor.past_bookings
        }
    }