import React from 'react';

/**
 * EventCard Component - Displays a list of events with images or text placeholders
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.events - Array of event objects to display
 * @param {string} props.events[].title - Event title
 * @param {string} props.events[].description - Event description
 * @param {string} props.events[].date - Event date
 * @param {string} props.events[].location - Event location
 * @param {string} props.events[].source - Event source organization
 * @param {string} props.events[].url - Event URL for more details
 * @param {string} [props.events[].image_url] - Event image URL
 * @param {string} [props.events[].imageUrl] - Alternative event image URL
 * @param {string} [props.events[].category] - Event category
 * @returns {JSX.Element} Rendered event cards or empty state
 */
const EventCard = ({ events = [] }) => {
    /**
     * Handles click events on event cards - opens event URL in new tab
     * @param {Object} eventData - Event object containing URL
     */
    const handleEventClick = (eventData) => {
        if (!eventData?.url || eventData.url === '#') {
            return;
        }
        
        try {
            window.open(eventData.url, '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.warn('Failed to open event URL:', error);
        }
    };

    /**
     * Validates if an image URL is usable
     * @param {string} imageUrl - URL to validate
     * @returns {boolean} True if URL is valid and usable
     */
    const isValidImageUrl = (imageUrl) => {
        return imageUrl && 
               typeof imageUrl === 'string' && 
               imageUrl.trim() !== '' && 
               imageUrl !== 'null' && 
               imageUrl !== 'undefined';
    };

    /**
     * Generates initials from event title for placeholder
     * @param {string} title - Event title
     * @returns {string} Generated initials (2 characters)
     */
    const generateEventInitials = (title) => {
        if (!title || typeof title !== 'string') {
            return 'EV';
        }

        const cleanTitle = title.trim();
        const meaningfulWords = cleanTitle
            .split(' ')
            .filter(word => word && word.length > 2);

        if (meaningfulWords.length >= 2) {
            return meaningfulWords
                .slice(0, 2)
                .map(word => word[0])
                .join('')
                .toUpperCase();
        }

        if (meaningfulWords.length === 1) {
            return meaningfulWords[0].substring(0, 2).toUpperCase();
        }

        return cleanTitle.substring(0, 2).toUpperCase() || 'EV';
    };

    /**
     * Gets color for event source
     * @param {string} source - Event source name
     * @returns {string} Hex color code
     */
    const getSourceColor = (source) => {
        const sourceColorMap = {
            'NASSCOM': '#2E86AB',
            'T-Hub': '#A23B72',
            'Startup Events': '#F18F01',
            'Inc42': '#C73E1D',
            'Eventbrite': '#F05537',
            'StartupNews': '#6A994E'
        };

        return sourceColorMap[source] || '#667eea';
    };

    /**
     * Handles image loading errors
     * @param {Event} errorEvent - Image error event
     */
    const handleImageError = (errorEvent) => {
        if (errorEvent?.target) {
            errorEvent.target.style.display = 'none';
        }
    };

    /**
     * Renders event image component
     * @param {Object} eventData - Event data object
     * @returns {JSX.Element} Image element
     */
    const renderEventImage = (eventData) => {
        const imageUrl = eventData.image_url || eventData.imageUrl;
        
        return (
            <img 
                src={imageUrl} 
                alt={eventData.title || 'Event image'}
                style={styles.eventImage}
                onError={handleImageError}
            />
        );
    };

    /**
     * Renders text placeholder for events without images
     * @param {Object} eventData - Event data object
     * @returns {JSX.Element} Placeholder component
     */
    const renderTextPlaceholder = (eventData) => {
        const initials = generateEventInitials(eventData.title);
        const backgroundColor = getSourceColor(eventData.source);
        
        return (
            <div style={{
                ...styles.placeholderContainer,
                background: `linear-gradient(135deg, ${backgroundColor} 0%, ${backgroundColor}cc 100%)`
            }}>
                <div>
                    <div style={styles.placeholderInitials}>
                        {initials}
                    </div>
                    <div style={styles.placeholderSource}>
                        {eventData.source || 'Event'}
                    </div>
                </div>
            </div>
        );
    };

    /**
     * Renders logo area (image or placeholder)
     * @param {Object} eventData - Event data object
     * @returns {JSX.Element} Logo component
     */
    const renderEventLogo = (eventData) => {
        const imageUrl = eventData.image_url || eventData.imageUrl;
        const hasValidImage = isValidImageUrl(imageUrl);
        
        return hasValidImage 
            ? renderEventImage(eventData)
            : renderTextPlaceholder(eventData);
    };

    /**
     * Renders category badge if category exists
     * @param {string} category - Event category
     * @returns {JSX.Element|null} Category badge or null
     */
    const renderCategoryBadge = (category) => {
        if (!category) {
            return null;
        }

        return (
            <span style={styles.categoryBadge}>
                {category}
            </span>
        );
    };

    /**
     * Renders empty state when no events are available
     * @returns {JSX.Element} Empty state component
     */
    const renderEmptyState = () => (
        <div style={styles.emptyState}>
            <p>No events found for the selected filters.</p>
            <p style={styles.emptyStateSubtext}>
                Try adjusting your search criteria or clear filters to see more events.
            </p>
        </div>
    );

    /**
     * Renders individual event card
     * @param {Object} eventData - Event data object
     * @param {number} index - Event index
     * @returns {JSX.Element} Event card component
     */
    const renderEventCard = (eventData, index) => (
        <div 
            key={`${eventData.title}-${index}`}
            style={styles.eventCard}
            onClick={() => handleEventClick(eventData)}
        >
            <div style={styles.eventContent}>
                <h3 style={styles.eventTitle}>
                    {eventData.title}
                </h3>
                
                <div style={styles.eventDetails}>
                    <span>📅 {eventData.date}</span>
                    <span>📍 {eventData.location}</span>
                </div>
                
                <p style={styles.eventDescription}>
                    {eventData.description}
                </p>
                
                {renderCategoryBadge(eventData.category)}
                
                <div style={styles.eventSource}>
                    {eventData.source}
                </div>
            </div>
            
            <div style={styles.eventLogo}>
                {renderEventLogo(eventData)}
            </div>
        </div>
    );

    // Early return for empty state
    if (!events.length) {
        return renderEmptyState();
    }

    // Main render
    return (
        <div>
            {events.map((eventData, index) => renderEventCard(eventData, index))}
        </div>
    );
};

// Centralized styles object for consistency and maintainability
const styles = {
    eventCard: {
        display: 'flex',
        border: '1px solid #ddd',
        borderRadius: '10px',
        padding: '20px',
        margin: '20px 0',
        backgroundColor: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        minHeight: '200px'
    },
    eventContent: {
        flex: '1',
        paddingRight: '20px'
    },
    eventLogo: {
        flexShrink: 0,
        width: '256px',
        height: '182px'
    },
    eventTitle: {
        fontSize: '18px',
        fontWeight: 'bold',
        margin: '0 0 10px 0',
        color: '#333'
    },
    eventDetails: {
        display: 'flex',
        gap: '20px',
        margin: '10px 0',
        fontSize: '14px',
        color: '#666'
    },
    eventDescription: {
        fontSize: '14px',
        color: '#555',
        lineHeight: '1.4',
        margin: '10px 0'
    },
    eventSource: {
        fontSize: '12px',
        color: '#888',
        fontWeight: 'bold',
        marginTop: '10px'
    },
    eventImage: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        borderRadius: '8px',
        border: '1px solid #eee',
        backgroundColor: '#f8f9fa'
    },
    placeholderContainer: {
        width: '100%',
        height: '100%',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: '28px',
        minHeight: '182px',
        minWidth: '256px',
        border: '2px solid rgba(255,255,255,0.2)'
    },
    placeholderInitials: {
        marginBottom: '8px',
        fontSize: '32px',
        fontWeight: '900'
    },
    placeholderSource: {
        fontSize: '12px',
        opacity: 0.9,
        fontWeight: 'normal'
    },
    categoryBadge: {
        display: 'inline-block',
        backgroundColor: '#e3f2fd',
        color: '#1976d2',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        marginRight: '8px'
    },
    emptyState: {
        textAlign: 'center',
        padding: '40px',
        color: '#666',
        fontSize: '16px'
    },
    emptyStateSubtext: {
        fontSize: '14px',
        color: '#888',
        marginTop: '10px'
    }
};

export default EventCard;