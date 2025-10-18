import React from 'react'
import './EventCard.css';
import claendarIcon from '../../assets/Events/calendar.svg';
import locationIcon from '../../assets/Events/location.svg';

const EventCard = ({ events = [] }) => {
    const handleEventClick = (event) => {
        if (event.url && event.url !== '#') {
            window.open(event.url, '_blank');
        }
    };

    return (
        events.length > 0 ? (
            events.map((event, index) => (
                <div 
                    className='event-card' 
                    key={`event-${index}-${event.title?.substring(0,10)}`}
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
                        
                        {/* Enhanced metadata */}
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
                        {(() => {
                            const scrapedImageSrc = event.image_url || event.imageUrl;
                            console.log(`DEBUG: Event "${event.title?.substring(0,20)}..." has image: ${!!scrapedImageSrc}`);
                            
                            if (scrapedImageSrc) {
                                return (
                                    <img 
                                        src={scrapedImageSrc} 
                                        alt={`${event.title} Logo`}
                                        style={{
                                            width: '100%',
                                            maxWidth: '256px',
                                            height: '182px',
                                            objectFit: 'contain',
                                            borderRadius: '10px',
                                            border: '1px solid #eee',
                                            backgroundColor: '#f8f9fa'
                                        }}
                                    />
                                );
                            }
                            
                            // Placeholder logic
                            const title = event.title || 'Event';
                            const words = title.split(' ').filter(word => word.length > 2);
                            let initials = words.slice(0, 2).map(word => word[0]).join('').toUpperCase();
                            if (!initials) initials = title.substring(0, 2).toUpperCase() || 'EV';
                            
                            const sourceColors = {
                                'NASSCOM': '#2E86AB',
                                'T-Hub': '#A23B72', 
                                'Startup Events': '#F18F01',
                                'Inc42': '#C73E1D',
                                'Eventbrite': '#F05537',
                                'StartupNews': '#6A994E'
                            };
                            const color = sourceColors[event.source] || '#667eea';
                            
                            console.log(`DEBUG: Rendering placeholder for "${title}" with initials "${initials}" and color "${color}"`);
                            return (
                                <div 
                                    className="debug-placeholder"
                                    style={{
                                        background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`,
                                        width: '100%',
                                        maxWidth: '256px',
                                        height: '182px',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        fontSize: '24px',
                                        border: '2px solid #fff',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                                    }}
                                >
                                    <div>
                                        <div style={{ marginBottom: '5px' }}>{initials}</div>
                                        <div style={{ fontSize: '10px', opacity: 0.8 }}>{event.source || 'Event'}</div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            ))
        ) : (
            <div className="no-events">
                <p>No events found for the selected filters.</p>
                <p style={{fontSize: '14px', color: '#888', marginTop: '10px'}}>
                    Try adjusting your search criteria or clear filters to see more events.
                </p>
            </div>
        )
    )
};

export default EventCard