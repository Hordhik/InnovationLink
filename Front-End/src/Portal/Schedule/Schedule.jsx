import React from 'react';
import './Schedule.css';

const Schedule = () => {
  const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const dates = [
    null, null, 1, 2, 3, 4, 5,
    6, 7, 8, 9, 10, 11, 12,
    13, 14, 15, 16, 17, 18, 19,
    20, 21, 22, 23, 24, 25, 26,
    27, 28, 29, 30, 31, null, null,
  ];

  const highlightedDates = [4, 5, 15];

  const agendaItems = [
    {
      date: 'Today, July 12',
      items: [
        { title: 'Mentor Session with EcoPack Solutions', time: '10:00 AM', isChecked: false },
        { title: 'UI2DEV Team Sync', time: '02:30 PM', isChecked: false },
        { title: 'Draft pitch deck for investor review', time: '12:00 PM', isChecked: true },
        { title: 'Research market trends for Q3', time: '4:00 PM', isChecked: false },
      ],
    },
    {
      date: 'Tomorrow, July 13',
      items: [
        { title: 'Call with Prospective Investor', time: '11:00 AM', isChecked: false },
        { title: 'Update website content', time: '10:00 AM', isChecked: true },
        { title: 'Follow up on patent application status', time: '3:00 PM', isChecked: false },
      ],
    },
    {
      date: 'Wednesday, July 14',
      items: [],
    },
  ];

  return (
    <div className="schedule-container">
      <div className="calendar-container">
        <div className="calendar-header">
          <div className="calendar-nav">
            <button className="today-button">Today</button>
            <div className="month-nav">
              <button className="nav-button">&lt;</button>
              <span className="month-year">July, 2025</span>
              <button className="nav-button">&gt;</button>
            </div>
          </div>
          <button className="add-item-button">
            <span className="plus-icon">+</span>
            <span>Add Item</span>
          </button>
        </div>
        <div className="calendar-body">
          <div className="weekdays">
            {weekdays.map((day, index) => (
              <div key={index} className="weekday">{day}</div>
            ))}
          </div>
          <div className="date-grid">
            {dates.map((date, index) => (
              <div key={index} className={`date-cell ${date && highlightedDates.includes(date) ? 'highlighted' : ''}`}>
                {date}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="agenda-container">
        {agendaItems.map((day, index) => (
          <div key={index} className="agenda-day">
            <h3 className="agenda-date-header">{day.date}</h3>
            {day.items.map((item, itemIndex) => (
              <div key={itemIndex} className="agenda-item">
                <div className="agenda-item-left">
                  {item.isChecked ? (
                    <div className="checkbox-checked">
                      <span className="check-icon">&#10003;</span>
                    </div>
                  ) : (
                    <div className="checkbox-unchecked"></div>
                  )}
                  <span className="item-time">{item.time}</span>
                </div>
                <div className="item-title">{item.title}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;