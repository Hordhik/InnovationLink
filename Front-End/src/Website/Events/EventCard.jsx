import React from 'react'
import './EventCard.css';
import claendarIcon from '../../assets/Events/calendar.svg';
import locationIcon from '../../assets/Events/location.svg';
import Mahakumbh from '../../assets/Events/mahakumb.png';
import inspireIndia from '../../assets/Events/inspire.png';
import bengaluruTechSumit from '../../assets/Events/tech.jpg';

const EventCard = ({ events = [] }) => {

    const logoMap = {
        Mahakumbh,
        inspireIndia,
        bengaluruTechSumit
    };

  return (
    events.length > 0 ? (
        events.map((event, index) => (
            <div className='event-card' key={index}>
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
                </div>
                <div className="event-logo">
                    <img src={logoMap[event.logo]} alt={`${event.title} Logo`} />
                </div>
            </div>
        ))
    ) : (
        <div className="no-events">
            <p>No events found for the selected filters.</p>
        </div>
    )
  )
};

export default EventCard