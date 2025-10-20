from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    date: Optional[datetime] = None
    location: Optional[str] = None
    organizer: str
    source_url: str
    event_type: str  # "startup_program", "government_scheme", "incubator", "funding"
    tags: Optional[List[str]] = []

class EventCreate(EventBase):
    pass

class Event(EventBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ScrapingResult(BaseModel):
    source: str
    events_found: int
    success: bool
    error_message: Optional[str] = None
    timestamp: datetime