import React from 'react'

const EventCard = ({ events = [] }) => {
    console.log('🎯 EventCard received:', events?.length || 0, 'events');
    
    const handleEventClick = (event) => {
        if (event.url && event.url !== '#') {
            window.open(event.url, '_blank');
        }
    };

    // Inline styles to avoid CSS loading issues
    const cardStyle = {
        display: 'flex',
        border: '1px solid #ddd',
        borderRadius: '10px',
        padding: '20px',
        margin: '20px 0',
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        minHeight: '200px'
    };

    const contentStyle = {
        flex: '1',
        paddingRight: '20px'
    };

    const logoStyle = {
        flexShrink: 0,
        width: '256px',
        height: '182px'
    };

    const titleStyle = {
        fontSize: '18px',
        fontWeight: 'bold',
        margin: '0 0 10px 0',
        color: '#333'
    };

    const detailStyle = {
        display: 'flex',
        gap: '20px',
        margin: '10px 0',
        fontSize: '14px',
        color: '#666'
    };

    const descriptionStyle = {
        fontSize: '14px',
        color: '#555',
        lineHeight: '1.4',
        margin: '10px 0'
    };

    const sourceStyle = {
        fontSize: '12px',
        color: '#888',
        fontWeight: 'bold',
        marginTop: '10px'
    };

    const renderLogo = (event) => {
        const hasImage = event.image_url || event.imageUrl;
        
        if (hasImage) {
            return (
                <img 
                    src={event.image_url || event.imageUrl} 
                    alt={event.title}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        border: '1px solid #eee',
                        backgroundColor: '#f8f9fa'
                    }}
                />
            );
        }
        
        // Placeholder
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
            <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${bgColor} 0%, ${bgColor}cc 100%)`,
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '28px'
            }}>
                <div>
                    <div style={{ marginBottom: '8px' }}>{initials}</div>
                    <div style={{ fontSize: '11px', opacity: 0.9 }}>
                        {event.source || 'Event'}
                    </div>
                </div>
            </div>
        );
    };

    if (!events.length) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#666',
                fontSize: '16px'
            }}>
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
        <div>
            {events.map((event, index) => (
                <div 
                    key={`${event.title}-${index}`}
                    style={cardStyle}
                    onClick={() => handleEventClick(event)}
                >
                    <div style={contentStyle}>
                        <h3 style={titleStyle}>{event.title}</h3>
                        
                        <div style={detailStyle}>
                            <span>📅 {event.date}</span>
                            <span>📍 {event.location}</span>
                        </div>
                        
                        <p style={descriptionStyle}>{event.description}</p>
                        
                        {event.category && (
                            <span style={{
                                display: 'inline-block',
                                backgroundColor: '#e3f2fd',
                                color: '#1976d2',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                marginRight: '8px'
                            }}>
                                {event.category}
                            </span>
                        )}
                        
                        <div style={sourceStyle}>{event.source}</div>
                    </div>
                    
                    <div style={logoStyle}>
                        {renderLogo(event)}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default EventCard;