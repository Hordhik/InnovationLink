import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); opacity: 0.9; }
        50% { transform: scale(1.05); opacity: 1; }
        100% { transform: scale(1); opacity: 0.9; }
    }
    
    @keyframes slideIn {
        from { 
            opacity: 0; 
            transform: translateX(100px); 
        }
        to { 
            opacity: 1; 
            transform: translateX(0); 
        }
    }
`;
if (!document.head.querySelector('style[data-event-card]')) {
    styleSheet.setAttribute('data-event-card', 'true');
    document.head.appendChild(styleSheet);
}

/**
 * EventCard Component - Displays a list of events with images or text placeholders
 * Features authentication-based blur for logged-out users
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
    const { user, loading } = useAuth();
    const isLoggedIn = !!user;
    const [showLoginModal, setShowLoginModal] = React.useState(false);

    /**
     * Handles click events on event cards - opens event URL in new tab or shows login modal
     * @param {Object} eventData - Event object containing URL
     */
    const handleEventClick = (eventData) => {
        // Show login modal when logged out
        if (!isLoggedIn) {
            setShowLoginModal(true);
            return;
        }
        
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
     * Renders the login modal for non-authenticated users
     * @returns {JSX.Element} Login modal component
     */
    const renderLoginModal = () => {
        if (!showLoginModal) return null;
        
        return (
            <div style={styles.modalOverlay} onClick={() => setShowLoginModal(false)}>
                <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                    <div style={styles.modalHeader}>
                        <h3 style={styles.modalTitle}>🔒 Login Required</h3>
                        <button 
                            style={styles.closeButton}
                            onClick={() => setShowLoginModal(false)}
                        >
                            ×
                        </button>
                    </div>
                    <div style={styles.modalBody}>
                        <p style={styles.modalMessage}>
                            You need to be logged in to view full event details and access exclusive features.
                        </p>
                        <div style={styles.modalBenefits}>
                            <div style={styles.modalBenefit}>✨ View complete event information</div>
                            <div style={styles.modalBenefit}>🎯 Get personalized recommendations</div>
                            <div style={styles.modalBenefit}>📅 Add events to your calendar</div>
                            <div style={styles.modalBenefit}>🤝 Connect with other attendees</div>
                        </div>
                    </div>
                    <div style={styles.modalActions}>
                        <button 
                            style={styles.modalLoginButton}
                            onClick={() => window.location.href = '/auth/login'}
                        >
                            Login Now
                        </button>
                        <button 
                            style={styles.modalSignupButton}
                            onClick={() => window.location.href = '/auth/signup'}
                        >
                            Create Account
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    /**
     * Renders individual event card with auth-aware styling and click behavior
     * @param {Object} eventData - Event data object
     * @param {number} index - Event index
     * @returns {JSX.Element} Event card component
     */
    const renderEventCard = (eventData, index) => (
        <div 
            key={`${eventData.title}-${index}`}
            style={{
                ...styles.eventCard,
                cursor: 'pointer', // Always clickable
                opacity: isLoggedIn ? 1 : 0.9,
                position: 'relative'
            }}
            onClick={() => handleEventClick(eventData)}
        >
            {/* Click hint overlay for logged-out users */}
            {!isLoggedIn && (
                <div style={styles.clickHintOverlay}>
                    <div style={styles.clickHint}>🔒 Click to Login</div>
                </div>
            )}
            
            <div style={styles.eventContent}>
                <h3 style={styles.eventTitle}>
                    {eventData.title}
                </h3>
                
                <div style={styles.eventDetails}>
                    <span>📅 {eventData.date}</span>
                    <span>📍 {eventData.location}</span>
                </div>
                
                <p style={styles.eventDescription}>
                    {isLoggedIn 
                        ? eventData.description 
                        : `${eventData.description?.substring(0, 100)}...`
                    }
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

    // Early return for loading state
    if (loading) {
        return (
            <div style={styles.loadingState}>
                <div>Loading events...</div>
            </div>
        );
    }

    // Early return for empty state
    if (!events.length) {
        return renderEmptyState();
    }

    // Main render with conditional blur and clickable content
    return (
        <div style={styles.eventsContainer}>
            {/* Events content with conditional blur but enabled clicks */}
            <div 
                style={{
                    ...styles.eventsContent,
                    filter: isLoggedIn ? 'none' : 'blur(1px)', // Lighter blur so users can see events exist
                    pointerEvents: 'auto' // Always allow clicks
                }}
            >
                {events.map((eventData, index) => renderEventCard(eventData, index))}
            </div>
            
            {/* Floating instruction for logged-out users */}
            {!isLoggedIn && (
                <div style={styles.floatingInstruction}>
                    <div style={styles.instructionCard}>
                        💡 <strong>Click any event to login and view details</strong>
                    </div>
                </div>
            )}
            
            {/* Login modal */}
            {renderLoginModal()}
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
    },
    
    // New styles for interactive blur feature
    eventsContainer: {
        position: 'relative',
        minHeight: '400px'
    },
    eventsContent: {
        transition: 'filter 0.3s ease-in-out'
    },
    clickHintOverlay: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 5
    },
    clickHint: {
        backgroundColor: 'rgba(0, 123, 255, 0.9)',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        animation: 'pulse 2s infinite'
    },
    floatingInstruction: {
        position: 'fixed',
        top: '100px',
        right: '20px',
        zIndex: 15,
        animation: 'slideIn 0.5s ease-out'
    },
    instructionCard: {
        backgroundColor: '#fff3cd',
        color: '#856404',
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid #ffeaa7',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontSize: '14px',
        maxWidth: '250px'
    },
    loadingState: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        fontSize: '16px',
        color: '#666'
    },
    
    // Modal styles for login prompt
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(3px)'
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '480px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
        animation: 'slideIn 0.3s ease-out'
    },
    modalHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px 16px',
        borderBottom: '1px solid #e1e5e9'
    },
    modalTitle: {
        margin: 0,
        fontSize: '20px',
        fontWeight: '600',
        color: '#333'
    },
    closeButton: {
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        color: '#666',
        padding: '0',
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    modalBody: {
        padding: '20px 24px'
    },
    modalMessage: {
        fontSize: '16px',
        color: '#555',
        lineHeight: '1.5',
        margin: '0 0 20px 0'
    },
    modalBenefits: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    modalBenefit: {
        fontSize: '14px',
        color: '#666',
        paddingLeft: '4px'
    },
    modalActions: {
        display: 'flex',
        gap: '12px',
        padding: '16px 24px 24px',
        borderTop: '1px solid #e1e5e9'
    },
    modalLoginButton: {
        flex: 1,
        padding: '12px 24px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s'
    },
    modalSignupButton: {
        flex: 1,
        padding: '12px 24px',
        backgroundColor: 'transparent',
        color: '#007bff',
        border: '2px solid #007bff',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s'
    }
};

export default EventCard;