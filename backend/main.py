from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, String, Integer, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
import uuid

URL = "sqlite:///./r53.db"
eng = create_engine(URL, connect_args={"check_same_thread": False})
LocSes = sessionmaker(autocommit=False, autoflush=False, bind=eng)
Base = declarative_base()

class HZ(Base):
    __tablename__ = "hz"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    comment = Column(String, nullable=True)
    count = Column(Integer, default=2)
    recs = relationship("Rec", back_populates="hz", cascade="all, delete-orphan")

class Rec(Base):
    __tablename__ = "rec"
    id = Column(String, primary_key=True, index=True)
    hz_id = Column(String, ForeignKey("hz.id", ondelete="CASCADE"))
    name = Column(String, index=True)
    type = Column(String)
    ttl = Column(Integer)
    val = Column(String)
    hz = relationship("HZ", back_populates="recs")

Base.metadata.create_all(bind=eng)

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class HZIn(BaseModel):
    name: str
    comment: str = None

class HZOut(BaseModel):
    id: str
    name: str
    comment: str = None
    count: int
    class Config:
        from_attributes = True

class RecIn(BaseModel):
    name: str
    type: str
    ttl: int
    val: str

class RecOut(BaseModel):
    id: str
    hz_id: str
    name: str
    type: str
    ttl: int
    val: str
    class Config:
        from_attributes = True

def get_db():
    db = LocSes()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/hz", response_model=list[HZOut])
def get_hzs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(HZ).offset(skip).limit(limit).all()

@app.post("/api/hz", response_model=HZOut)
def add_hz(req: HZIn, db: Session = Depends(get_db)):
    chk = db.query(HZ).filter(HZ.name == req.name).first()
    if chk:
        raise HTTPException(400)
    uid = str(uuid.uuid4())[:8].upper()
    new_hz = HZ(id=uid, name=req.name, comment=req.comment, count=2)
    db.add(new_hz)
    db.commit()
    db.refresh(new_hz)
    
    ns = Rec(id=str(uuid.uuid4()), hz_id=uid, name=req.name, type="NS", ttl=172800, val="ns-1.awsdns.com.\nns-2.awsdns.org.")
    soa = Rec(id=str(uuid.uuid4()), hz_id=uid, name=req.name, type="SOA", ttl=900, val="ns-1.awsdns.com. awsdns-hostmaster.amazon.com.")
    db.add_all([ns, soa])
    db.commit()
    return new_hz

@app.delete("/api/hz/{id}")
def del_hz(id: str, db: Session = Depends(get_db)):
    hz = db.query(HZ).filter(HZ.id == id).first()
    if not hz:
        raise HTTPException(404)
    db.delete(hz)
    db.commit()
    return {"ok": True}

@app.get("/api/hz/{id}/rec", response_model=list[RecOut])
def get_recs(id: str, db: Session = Depends(get_db)):
    return db.query(Rec).filter(Rec.hz_id == id).all()

@app.post("/api/hz/{id}/rec", response_model=RecOut)
def add_rec(id: str, req: RecIn, db: Session = Depends(get_db)):
    hz = db.query(HZ).filter(HZ.id == id).first()
    if not hz:
        raise HTTPException(404)
    rec = Rec(id=str(uuid.uuid4()), hz_id=id, name=req.name, type=req.type, ttl=req.ttl, val=req.val)
    db.add(rec)
    hz.count += 1
    db.commit()
    db.refresh(rec)
    return rec

@app.delete("/api/rec/{id}")
def del_rec(id: str, db: Session = Depends(get_db)):
    rec = db.query(Rec).filter(Rec.id == id).first()
    if not rec:
        raise HTTPException(404)
    hz = db.query(HZ).filter(HZ.id == rec.hz_id).first()
    if hz:
        hz.count -= 1
    db.delete(rec)
    db.commit()
    return {"ok": True}