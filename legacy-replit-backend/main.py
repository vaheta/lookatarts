from fastapi import FastAPI, HTTPException, Response, Depends, Cookie, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import datetime
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import select, Date, JSON, DateTime, text, BigInteger, Text, Float, Index
from sqlalchemy.exc import SQLAlchemyError
from contextlib import asynccontextmanager
from replit.object_storage import Client
from dotenv import load_dotenv
import ssl
import logging
import uuid
from datetime import timedelta
import sys

load_dotenv()

client = Client()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stderr)
    ]
)

# Database Models
class Base(DeclarativeBase):
    pass


class Image(Base):
    __tablename__ = "images"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    date: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    image_url: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[Dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=text('now()'), nullable=False)


class TimerEvent(Base):
    __tablename__ = "events"
    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    event_type: Mapped[str] = mapped_column(Text, nullable=False)  # "start" or "end"
    user_id: Mapped[str] = mapped_column(Text, nullable=True)  # Optional user identifier
    session_id: Mapped[str] = mapped_column(Text, nullable=False)  # To track unique sessions
    total_planned_duration: Mapped[int] = mapped_column(BigInteger, nullable=True)  # Planned duration in minutes
    duration_ms: Mapped[int] = mapped_column(BigInteger, nullable=True)  # Only for end events
    duration_percent: Mapped[float] = mapped_column(Float, nullable=True)  # Percentage of planned time completed
    event_metadata: Mapped[Dict] = mapped_column(JSON, nullable=True)  # For additional context data
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=text('now()'), nullable=False)
    __table_args__ = (
        Index('idx_timer_session_type', 'session_id', 'event_type', 'created_at'),
    )


# Create an SSL context for client connections
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

# Database setup
database_url = os.environ.get('DATABASE_URL')
if database_url:
    # Convert to asyncpg format
    database_url = database_url.replace('postgresql://',
                                        'postgresql+asyncpg://').replace(
                                            '?sslmode=require', '')

    # Create engine without SSL
    async_engine = create_async_engine(
        database_url,
        echo=False,
        # Add pool configuration
        pool_pre_ping=True,
        pool_recycle=3600,
        pool_size=20,
        max_overflow=40)
else:
    raise ValueError("DATABASE_URL environment variable is not set")

async_session = async_sessionmaker(async_engine,
                                   expire_on_commit=False,
                                   class_=AsyncSession)


# FastAPI models
class ImageMetadata(BaseModel):
    image_url: str
    description: Dict[str, Any]


class TimerStartEvent(BaseModel):
    session_id: str = None  # Now optional
    user_id: str = None
    total_planned_duration: int
    metadata: Dict[str, Any] = None


class TimerEndEvent(BaseModel):
    session_id: str
    metadata: Dict[str, Any] = None


# Helper function to extract user ID from cookie header
def extract_user_id_from_cookie(request: Request) -> str:
    raw_cookie_header = request.headers.get("cookie", "")
    if "user_id=" in raw_cookie_header:
        try:
            cookie_parts = raw_cookie_header.split(";")
            for part in cookie_parts:
                if "user_id=" in part:
                    return part.split("=")[1].strip()
        except Exception:
            pass
    return None


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        async with async_engine.begin() as conn:
            await conn.execute(text("SELECT 1"))  # Ensures DB is reachable
            # Create tables if they don't exist
            await conn.run_sync(Base.metadata.create_all)
        logging.info("Database connection verified and tables created if needed.")
    except Exception as e:
        logging.error(f"Database connection failed: {str(e)}")
        raise RuntimeError("Failed to connect to the database")

    yield  # Allow the app to run

    # Cleanup
    await async_engine.dispose()


app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def get_db():
    async with async_session() as session:
        try:
            yield session
        except SQLAlchemyError as e:
            logging.error(f"Database error: {str(e)}")
            raise HTTPException(status_code=500,
                                detail="Database operation failed")
        finally:
            await session.close()


@app.get("/")
def read_root():
    return "Buenos días, it's a backend!"


@app.get("/health")
async def health_check():
    try:
        async with async_session() as session:
            await session.execute(select(1))
        return {"status": "healthy"}
    except SQLAlchemyError as e:
        logging.error(f"Database health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Database is unavailable")


@app.get("/api/todays_pic/metadata")
async def get_todays_pic_metadata(session: AsyncSession = Depends(get_db)):
    try:
        today = datetime.date.today()
        result = await session.execute(
            select(Image).where(Image.date == today))
        image = result.scalar_one_or_none()

        if not image:
            result = await session.execute(
                select(Image).order_by(Image.date.desc()).limit(1))
            image = result.scalar_one_or_none()

        if image:
            return ImageMetadata(image_url=image.image_url,
                                 description=image.description)

        raise HTTPException(status_code=404,
                            detail="No images found in the database")
    except SQLAlchemyError as e:
        logging.error(f"Database query failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error")


@app.get("/api/storage/{image_url:path}")
async def get_image(image_url: str):
    if not image_url:
        raise HTTPException(status_code=400, detail="Image URL is required")

    try:
        logging.info(f"Attempting to fetch image: {image_url}")

        if not client.exists(image_url):
            logging.error(f"Image not found in storage: {image_url}")
            raise HTTPException(status_code=404,
                                detail="Image not found in storage")

        image_data = client.download_as_bytes(image_url)
        if not image_data:
            logging.error(f"Image data is empty: {image_url}")
            raise HTTPException(status_code=404, detail="Image data is empty")

        return Response(content=image_data, media_type="image/jpeg")
    except FileNotFoundError as e:
        logging.error(f"Image not found error: {image_url} - {str(e)}")
        raise HTTPException(status_code=404,
                            detail=f"Image not found in storage: {str(e)}")
    except (PermissionError, OSError) as e:
        logging.error(f"Storage access error: {image_url} - {str(e)}")
        raise HTTPException(status_code=500,
                            detail=f"Storage access error: {str(e)}")
    except Exception as e:
        logging.error(
            f"Unexpected error while fetching image: {image_url} - {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve image: {type(e).__name__} - {str(e)}")


@app.post("/api/timer/start")
async def record_timer_start(
    event: TimerStartEvent, 
    response: Response,
    request: Request,
    session: AsyncSession = Depends(get_db),
    user_id_cookie: str = Cookie(None)
):
    try:
        # Get user_id from cookie or generate new one
        user_id = user_id_cookie or extract_user_id_from_cookie(request) or event.user_id
        
        # If no user_id from any source, generate one
        if not user_id:
            user_id = str(uuid.uuid4())
            
            # Set cookie
            response.set_cookie(
                key="user_id",
                value=user_id,
                max_age=31536000,  # 1 year in seconds
                httponly=True,
                samesite="lax",
                secure=True,
            )
        
        # Use provided session_id or generate a new one
        session_id = event.session_id or str(uuid.uuid4())
        
        timer_event = TimerEvent(
            event_type="start",
            user_id=user_id,
            session_id=session_id,
            total_planned_duration=event.total_planned_duration,
            event_metadata=event.metadata
        )
        session.add(timer_event)
        await session.commit()
        
        return {
            "status": "success", 
            "event_id": timer_event.id,
            "session_id": session_id,
            "user_id": user_id
        }
    except SQLAlchemyError as e:
        logging.error(f"Failed to record timer start: {str(e)}")
        await session.rollback()
        raise HTTPException(status_code=500, detail="Failed to record timer event")


@app.post("/api/timer/end")
async def record_timer_end(
    event: TimerEndEvent,
    request: Request,
    session: AsyncSession = Depends(get_db),
    user_id_cookie: str = Cookie(None)
):
    try:
        # Find the most recent start event for this session
        result = await session.execute(
            select(TimerEvent)
            .where(
                TimerEvent.session_id == event.session_id,
                TimerEvent.event_type == "start"
            )
            .order_by(TimerEvent.created_at.desc())
            .limit(1)
        )
        start_event = result.scalar_one_or_none()
        
        if not start_event:
            raise HTTPException(status_code=400, detail="No matching start event found for this timer")
        
        # Get user_id from cookie or header, with fallback to the start event's user_id
        user_id = user_id_cookie or extract_user_id_from_cookie(request) or start_event.user_id
        
        # Use planned duration from the start event for consistency
        total_planned_duration = start_event.total_planned_duration
        
        # Calculate actual duration based on timestamps
        start_time = start_event.created_at
        end_time = datetime.datetime.now(datetime.timezone.utc)
        duration_ms = int((end_time - start_time).total_seconds() * 1000)
        
        # Calculate percentage of planned time completed
        planned_duration_ms = total_planned_duration * 60 * 1000  # convert minutes to ms
        duration_percent = (duration_ms / planned_duration_ms) * 100 if planned_duration_ms > 0 else 0
        
        timer_event = TimerEvent(
            event_type="end",
            user_id=user_id,
            session_id=event.session_id,
            total_planned_duration=total_planned_duration,  # From start event
            duration_ms=duration_ms,
            duration_percent=duration_percent,
            event_metadata=event.metadata
        )
        
        session.add(timer_event)
        await session.commit()
        
        return {
            "status": "success", 
            "event_id": timer_event.id,
            "duration_ms": duration_ms,
            "duration_percent": duration_percent,
            "total_planned_duration": total_planned_duration
        }
    except HTTPException as e:
        raise
    except SQLAlchemyError as e:
        logging.error(f"Failed to record timer end: {str(e)}")
        await session.rollback()
        raise HTTPException(status_code=500, detail="Failed to record timer event")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3333)
