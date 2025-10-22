import mysql.connector
from datetime import datetime
from typing import List, Dict, Any
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class DatabaseManager:
    def __init__(self):
        self.db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'user': os.getenv('DB_USER', 'root'),
            'password': os.getenv('DB_PASSWORD', ''),
            'database': os.getenv('DB_NAME', 'innovation_link'),
            'port': int(os.getenv('DB_PORT', 3306))
        }
        self.init_database()
    
    def get_connection(self):
        """Get a database connection"""
        return mysql.connector.connect(**self.db_config)
    
    def init_database(self):
        """Initialize the database with required tables"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Events table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS bot_events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(500) NOT NULL,
                description TEXT,
                date DATE,
                location VARCHAR(255),
                organizer VARCHAR(255) NOT NULL,
                source_url VARCHAR(1000) NOT NULL,
                event_type VARCHAR(100) NOT NULL,
                tags JSON,
                image_url VARCHAR(1000),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_event (title(255), organizer, source_url(255))
            )
        """)
        
        # Scraping logs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS bot_scraping_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                source VARCHAR(255) NOT NULL,
                events_found INT DEFAULT 0,
                success BOOLEAN DEFAULT FALSE,
                error_message TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        conn.commit()
        cursor.close()
        conn.close()
    
    def insert_event(self, event_data: Dict[str, Any]) -> int:
        """Insert a new event into the database"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        tags_json = json.dumps(event_data.get('tags', []))
        
        query = """
            INSERT INTO bot_events 
            (title, description, date, location, organizer, source_url, event_type, tags, image_url, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
            description = VALUES(description),
            date = VALUES(date),
            location = VALUES(location),
            event_type = VALUES(event_type),
            tags = VALUES(tags),
            image_url = VALUES(image_url),
            updated_at = VALUES(updated_at)
        """
        
        cursor.execute(query, (
            event_data['title'],
            event_data.get('description'),
            event_data.get('date'),
            event_data.get('location'),
            event_data['organizer'],
            event_data['source_url'],
            event_data['event_type'],
            tags_json,
            event_data.get('image_url'),
            datetime.now()
        ))
        
        event_id = cursor.lastrowid
        conn.commit()
        cursor.close()
        conn.close()
        return event_id
    
    def add_event(self, title: str, description: str = None, date: str = None, 
                  location: str = None, url: str = None, source: str = None, 
                  event_type: str = "startup_program", image_url: str = None) -> int:
        """Add event with individual parameters (for scraper compatibility)"""
        event_data = {
            'title': title,
            'description': description,
            'date': date,
            'location': location,
            'organizer': source or 'Unknown',
            'source_url': url or '',
            'event_type': event_type,
            'tags': [],
            'image_url': image_url
        }
        return self.insert_event(event_data)
    
    def get_events(self, limit: int = 50, event_type: str = None) -> List[Dict[str, Any]]:
        """Retrieve events from the database"""
        conn = self.get_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = "SELECT * FROM bot_events"
        params = []
        
        if event_type:
            query += " WHERE event_type = %s"
            params.append(event_type)
        
        query += " ORDER BY created_at DESC LIMIT %s"
        params.append(limit)
        
        cursor.execute(query, params)
        events = cursor.fetchall()
        
        # Parse tags JSON and convert datetime objects to strings
        for event in events:
            event['tags'] = json.loads(event['tags']) if event['tags'] else []
            if event['created_at']:
                event['created_at'] = event['created_at'].isoformat()
            if event['updated_at']:
                event['updated_at'] = event['updated_at'].isoformat()
            if event['date']:
                event['date'] = event['date'].isoformat()
        
        cursor.close()
        conn.close()
        return events
    
    def log_scraping_result(self, source: str, events_found: int, success: bool, error_message: str = None):
        """Log scraping results"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO bot_scraping_logs (source, events_found, success, error_message)
            VALUES (%s, %s, %s, %s)
        """, (source, events_found, success, error_message))
        
        conn.commit()
        cursor.close()
        conn.close()
    
    def get_scraping_logs(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Get recent scraping logs"""
        conn = self.get_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT * FROM bot_scraping_logs 
            ORDER BY timestamp DESC 
            LIMIT %s
        """, (limit,))
        
        logs = cursor.fetchall()
        
        # Convert datetime objects to strings
        for log in logs:
            if log['timestamp']:
                log['timestamp'] = log['timestamp'].isoformat()
        
        cursor.close()
        conn.close()
        return logs
    
    def get_event_count(self) -> int:
        """Get total number of events"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM bot_events")
        count = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        return count
    
    def cleanup_old_events(self, days: int = 365):
        """Remove events older than specified days"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            DELETE FROM bot_events 
            WHERE created_at < DATE_SUB(NOW(), INTERVAL %s DAY)
        """, (days,))
        
        deleted_count = cursor.rowcount
        conn.commit()
        cursor.close()
        conn.close()
        
        return deleted_count