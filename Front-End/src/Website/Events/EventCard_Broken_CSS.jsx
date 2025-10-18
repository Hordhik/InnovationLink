import React from 'react'
import './EventCard.css';
import claendarIcon from '../../assets/Events/calendar.svg';
import locationIcon from '../../assets/Events/location.svg';

const EventCard = ({ events = [] }) => {
    console.log('🎯 EventCard received:', events?.length || 0, 'events');
    
    const handleEventClick = (event) => {
        if (event.url && event.url !== '#') {
            window.open(event.url, '_blank');
        }
    };

    // Simple, bulletproof image/placeholder renderer
    const renderLogo = (event) => {
        const hasImage = event.image_url || event.imageUrl;
        
        if (hasImage) {
            // Show image
            return (
                <img 
                    src={event.image_url || event.imageUrl} 
                    alt={event.title}
                    style={{
                        width: '100%',
                        maxWidth: '256px',
                        height: '182px',
                        objectFit: 'contain',
                        borderRadius: '10px',
                        border: '1px solid #eee',
                        backgroundColor: '#f8f9fa'
                    }}
                    onError={(e) => {
                        // If image fails, replace with placeholder
                        e.target.style.display = 'none';
                        const placeholder = e.target.nextElementSibling;
                        if (placeholder) placeholder.style.display = 'flex';
                    }}
                />
            );
        } else {
            // Show placeholder immediately
            const title = event.title || 'Event';
            const words = title.split(' ').filter(word => word.length > 2);
            const initials = words.length >= 2 
                ? words.slice(0, 2).map(word => word[0]).join('').toUpperCase()
                : title.substring(0, 2).toUpperCase() || 'EV';
            
            const colors = {
                'NASSCOM': '#2E86AB',
                'T-Hub': '#A23B72', 
                'Startup Events': '#F18F01',
                'Inc42': '#C73E1D',
                'Eventbrite': '#F05537',
                'StartupNews': '#6A994E'
            };
            const bgColor = colors[event.source] || '#667eea';
            
            return (
                <div 
                    style={{
                        width: '100%',
                        maxWidth: '256px',
                        height: '182px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}cc 100%)`,
                        color: 'white',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        border: '2px solid rgba(255,255,255,0.3)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                >
                    <div>
                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>
                            {initials}
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.9 }}>
                            {event.source || 'Event'}
                        </div>
                    </div>
                </div>
            );
        }
    };

    if (!events.length) {
        return (
            <div className="no-events">
                <p>No events found for the selected filters.</p>
                <p style={{fontSize: '14px', color: '#888', marginTop: '10px'}}>
                    Try adjusting your search criteria or clear filters to see more events.
                </p>
                <p style={{fontSize: '12px', color: '#999', marginTop: '10px'}}>
                    DEBUG: EventCard received {events?.length || 0} events
                </p>
            </div>
        );
    }

    return (
        <>
            {events.map((event, index) => (
                <div 
                    className='event-card' 
                    key={`${event.title}-${index}`}
                    onClick={() => handleEventClick(event)}
                    style={{ cursor: event.url && event.url !== '#' ? 'pointer' : 'default' }}
                >
                    <div className="event-content">
                        <p className='event-title'>{event.title}</p>
                        <div className="event-details">
                            <div className="event-detail">
                                <img src={claendarIcon} alt="Calendar Icon" />
                                <p>{event.date}</p>
                            </div>
                            <div className="event-detail">
                                <img src={locationIcon} alt="Location Icon" />
                                <p>{event.location}</p>
                            </div>
                        </div>
                        <p className='event-description'>{event.description}</p>
                        
                        <div className="event-metadata">
                            {event.category && (
                                <span className="event-category">{event.category}</span>
                            )}
                            {event.source && (
                                <span className="event-source">{event.source}</span>
                            )}
                        </div>
                    </div>
                    
                    <div className="event-logo">
                        {renderLogo(event)}
                    </div>
                </div>
            ))}
        </>
    );
};

export default EventCard;