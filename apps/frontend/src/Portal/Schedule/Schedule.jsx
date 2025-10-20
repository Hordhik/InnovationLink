import React, { useState, useEffect } from "react";
import { Plus, User, MoreVertical, Edit2, Trash2 } from "lucide-react";
import "./Schedule.css";
import AddItemModal from "./AddItemModal"; // <--- 1. IMPORT THE NEW MODAL

const Schedule = () => {
  const [events, setEvents] = useState({
    // ... your existing events state ...
    "2025-10-01": [
      { time: "09:00 AM", title: "Team standup meeting", user: true, description: "Daily sync: blockers, priorities, and progress." },
      { time: "02:00 PM", title: "Product roadmap review", user: true, description: "Review Q4 roadmap items and dependencies." },
      { time: "04:30 PM", title: "Update marketing materials", done: true, description: "Refresh landing page copy and assets." },
    ],
    "2025-10-05": [
      { time: "10:00 AM", title: "Investor pitch preparation", user: true, description: "Polish slides and rehearse key metrics." },
      { time: "01:00 PM", title: "Review Q4 financial projections", done: true, description: "Double-check revenue and burn-rate assumptions." },
      { time: "03:30 PM", title: "Client demo session", description: "Demo new feature set to ACME Co." },
      { time: "05:00 PM", title: "Team building activity", user: true, description: "Casual hangout and online games." },
    ],
    "2025-10-08": [
      { time: "11:00 AM", title: "Strategic planning workshop", user: true, description: "Define OKRs and key results for next quarter." },
      { time: "02:30 PM", title: "Code review with dev team", user: true, description: "Review PRs #241–#248 and discuss refactors." },
    ],
    "2025-10-12": [
      { time: "10:00 AM", title: "Mentor Session with EcoPack Solutions", user: true, description: "Discuss packaging sustainability strategies." },
      { time: "02:30 PM", title: "UI2DEV Team Sync", user: true, description: "Align UI handoffs and API contracts." },
      { time: "12:00 PM", title: "Draft pitch deck for investor review", done: true, description: "Create v1 narrative and visuals." },
      { time: "04:00 PM", title: "Research market trends for Q4", description: "Collect data from industry reports." },
    ],
    "2025-10-13": [
      { time: "11:00 AM", title: "Call with Prospective Investor", user: true, description: "Intro call, gauge interest, next steps." },
      { time: "10:00 AM", title: "Update website content", done: true, description: "Add case studies and testimonials." },
      { time: "03:00 PM", title: "Follow up on patent application status", description: "Email attorney; check USPTO portal." },
    ],
    "2025-10-15": [
      { time: "09:30 AM", title: "Customer feedback analysis meeting", description: "Synthesize insights from NPS and interviews." },
      { time: "01:00 PM", title: "Design sprint planning", user: true, description: "Scope sprint goals and participants." },
      { time: "03:30 PM", title: "Review competitor analysis", done: true, description: "Summarize differentiators and gaps." },
      { time: "05:00 PM", title: "Weekly team retrospective", user: true, description: "What went well, what can improve." },
    ],
    "2025-10-18": [
      { time: "10:00 AM", title: "Product launch strategy meeting", user: true, description: "Finalize GTM plan and timelines." },
      { time: "12:30 PM", title: "Investor relations update", description: "Send monthly update email." },
      { time: "02:00 PM", title: "Marketing campaign review", done: true, description: "Check CTR, CPC, and conversions." },
      { time: "04:30 PM", title: "Partnership opportunities discussion", user: true, description: "Explore co-marketing collaborations." },
    ],
    "2025-10-20": [
      { time: "09:00 AM", title: "Sales pipeline review", user: true, description: "Stage movement and forecast accuracy." },
      { time: "11:30 AM", title: "Technical architecture planning", description: "Decide on queueing and caching layers." },
      { time: "02:00 PM", title: "User research findings presentation", user: true, description: "Share key insights with stakeholders." },
      { time: "04:00 PM", title: "Budget allocation meeting", description: "Rebalance spend across initiatives." },
    ],
    "2025-10-22": [
      { time: "10:30 AM", title: "Board meeting preparation", user: true, description: "Draft agenda and collect reports." },
      { time: "01:00 PM", title: "Legal compliance review", done: true, description: "Annual policy and data audit." },
      { time: "03:30 PM", title: "New hire orientation session", user: true, description: "Company intro and toolkit setup." },
    ],
    "2025-10-25": [
      { time: "09:00 AM", title: "Sprint planning for November", user: true, description: "Backlog grooming and velocity review." },
      { time: "11:00 AM", title: "Customer success check-in calls", description: "Follow up on recent support tickets." },
      { time: "02:30 PM", title: "Technology stack evaluation", user: true, description: "Assess observability options and costs." },
      { time: "04:00 PM", title: "Social media content planning", done: true, description: "Plan posts and creative themes." },
      { time: "05:30 PM", title: "Team knowledge sharing session", user: true, description: "Lightning talks on recent learnings." },
    ],
    "2025-10-28": [
      { time: "10:00 AM", title: "Quarterly business review", user: true, description: "KPIs, revenue, churn, and outlook." },
      { time: "01:00 PM", title: "Partnership contract negotiations", description: "Finalize terms and payment schedule." },
      { time: "03:00 PM", title: "Product feature prioritization", user: true, description: "RICE scoring for upcoming features." },
      { time: "05:00 PM", title: "End of month financial review", done: true, description: "Close books and reconcile expenses." },
    ],
    "2025-10-30": [
      { time: "09:30 AM", title: "Halloween team celebration planning", user: true, description: "Organize venue, theme, and budget." },
      { time: "11:00 AM", title: "November goals setting workshop", user: true, description: "Set measurable targets for teams." },
      { time: "02:00 PM", title: "Vendor contract renewals review", description: "Compare offers and negotiate discounts." },
      { time: "04:30 PM", title: "Monthly all-hands meeting", user: true, description: "Company updates and AMA." },
    ],
  });

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  );
  const [hoveredDate, setHoveredDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // <--- 2. ADD MODAL STATE
  const [openMenuIndex, setOpenMenuIndex] = useState(null); // Track which menu is open
  const [editingEvent, setEditingEvent] = useState(null); // Track event being edited: { date, index, event }

  // --- 3. ADD SAVE HANDLER ---
  const handleSaveEvent = (date, newEvent) => {
    setEvents(prevEvents => {
      // If we're editing an existing event
      if (editingEvent) {
        const updatedEvents = [...(prevEvents[editingEvent.date] || [])];
        updatedEvents[editingEvent.index] = newEvent;
        
        // Sort events by time
        updatedEvents.sort((a, b) => {
          const timeA = new Date(`1970/01/01 ${a.time}`);
          const timeB = new Date(`1970/01/01 ${b.time}`);
          return timeA - timeB;
        });

        return {
          ...prevEvents,
          [editingEvent.date]: updatedEvents
        };
      }

      // Otherwise, add a new event
      const dayEvents = prevEvents[date] || [];
      const updatedDayEvents = [...dayEvents, newEvent];

      // Sort events by time to keep the list chronological
      updatedDayEvents.sort((a, b) => {
        const timeA = new Date(`1970/01/01 ${a.time}`);
        const timeB = new Date(`1970/01/01 ${b.time}`);
        return timeA - timeB;
      });

      return {
        ...prevEvents,
        [date]: updatedDayEvents
      };
    });
    setIsModalOpen(false); // Close modal after saving
    setEditingEvent(null); // Clear editing state
  };

  const toggleEventDone = (date, eventIndex) => {
    setEvents(prevEvents => ({
      ...prevEvents,
      [date]: prevEvents[date].map((event, idx) => 
        idx === eventIndex ? { ...event, done: !event.done } : event
      )
    }));
  };

  const handleDeleteEvent = (date, eventIndex) => {
    setEvents(prevEvents => ({
      ...prevEvents,
      [date]: prevEvents[date].filter((_, idx) => idx !== eventIndex)
    }));
    setOpenMenuIndex(null); // Close the menu after deleting
  };

  const handleEditEvent = (date, eventIndex) => {
    // Get the event data to edit
    const eventToEdit = events[date][eventIndex];
    
    // Set the editing state
    setEditingEvent({
      date: date,
      index: eventIndex,
      event: eventToEdit
    });
    
    // Close the menu and open the modal
    setOpenMenuIndex(null);
    setIsModalOpen(true);
  };

  const toggleMenu = (index) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuIndex !== null && !event.target.closest('.event-menu-container')) {
        setOpenMenuIndex(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openMenuIndex]);

  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
    setSelectedDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`);
  };

  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const isDatePast = (day, month, year) => {
    const checkDate = new Date(year, month, day);
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return checkDate < todayDate;
  };

  const getMonthName = (month) => {
    const months = ["January", "February", "March", "April", "May", "June", 
                    "July", "August", "September", "October", "November", "December"];
    return months[month];
  };

  const getPendingTasks = (date) => {
    if (!events[date]) return [];
    return events[date].filter(event => !event.done);
  };

  const formatHeading = (isoDate) =>
    new Date(isoDate).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="schedule">
      {/* --- 4. RENDER THE MODAL (conditionally) --- */}
      {isModalOpen && (
        <AddItemModal 
          onClose={() => {
            setIsModalOpen(false);
            setEditingEvent(null); // Clear editing state when closing
          }}
          onSave={handleSaveEvent}
          selectedDate={editingEvent ? editingEvent.date : selectedDate}
          editingEvent={editingEvent ? editingEvent.event : null}
        />
      )}
      {/* ------------------------------------------- */}

      <button className="btn-primary" onClick={() => setIsModalOpen(true)}> {/* <-- 5. UPDATE ONCLICK */}
        <Plus size={14} /> Add item
      </button>
      <div className="schedule-content">
      {/* Left Calendar Section */}
        <div className="schedule-left">
          <div className="schedule-left-header">
            <button className="btn-outline" onClick={goToToday}>Today</button>
            <div className="month-row">
              <button className="btn-outline" onClick={previousMonth}>&#8249;</button>
              <div className="month-title">{getMonthName(currentMonth)}, {currentYear}</div>
              <button className="btn-outline" onClick={nextMonth}>&#8250;</button>
            </div>
          </div>

          <div className="weekday-row">
            {["M", "T", "W", "T", "F", "S", "S"].map((d) => (
              <div key={d} className="weekday">{d}</div>
            ))}
          </div>

          <div className="days-grid">
            {[...Array(getFirstDayOfMonth(currentMonth, currentYear) === 0 ? 6 : getFirstDayOfMonth(currentMonth, currentYear) - 1)].map((_, i) => (
              <div key={`empty-${i}`} className="day-cell" style={{ visibility: 'hidden' }}></div>
            ))}
            
            {[...Array(getDaysInMonth(currentMonth, currentYear))].map((_, i) => {
              const day = i + 1;
              const iso = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isSelected = iso === selectedDate;
              const isPast = isDatePast(day, currentMonth, currentYear);
              return (
                <div
                  key={day}
                  className={`day-cell ${isSelected ? "day-selected" : ""} ${isPast ? "day-past" : ""}`}
                  onClick={() => setSelectedDate(iso)}
                  onMouseEnter={() => setHoveredDate(iso)}
                  onMouseLeave={() => setHoveredDate(null)}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* Hover Task Preview */}
          {hoveredDate && getPendingTasks(hoveredDate).length > 0 && (
            <div className="hover-tasks">
              <h4>Pending Tasks for {formatHeading(hoveredDate)}</h4>
              {getPendingTasks(hoveredDate).map((task, idx) => (
                <div key={idx} className="hover-task">
                  • {task.title} - {task.time}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Schedule Section */}
        <div className="schedule-right">
          <div className="day-block">
            <h2 className="day-heading">{formatHeading(selectedDate)}</h2>
            <div className="events-list">
              {events[selectedDate] && events[selectedDate].length > 0 ? (
                // --- 6. ADD A SORT TO THE RENDER ---
                // This ensures newly added items appear in the correct time slot
                [...events[selectedDate]].sort((a, b) => {
                  const timeA = new Date(`1970/01/01 ${a.time}`);
                  const timeB = new Date(`1970/01/01 ${b.time}`);
                  return timeA - timeB;
                }).map((e, idx) => (
                  <div key={idx} className="event-row">
                    <div className="event-left">
                      <div className="event-header">
                        <input
                          type="checkbox"
                          checked={!!e.done}
                          onChange={() => toggleEventDone(selectedDate, idx)}
                        />
                        <div className="event-meta">
                          <div className={`event-title ${e.done ? "done" : ""}`}>{e.title}</div>
                          {e.description && (
                            <div className="event-description">{e.description}</div>
                          )}
                        </div>
                      </div>
                      <div className="event-time">{e.time}</div>
                    </div>
                    <div className="event-menu-container">
                      <button 
                        className="event-menu-btn"
                        onClick={() => toggleMenu(idx)}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openMenuIndex === idx && (
                        <div className="event-menu-dropdown">
                          <button 
                            className="event-menu-item"
                            onClick={() => handleEditEvent(selectedDate, idx)}
                          >
                            <Edit2 size={14} />
                            <span>Edit</span>
                          </button>
                          <button 
                            className="event-menu-item event-menu-item-delete"
                            onClick={() => handleDeleteEvent(selectedDate, idx)}
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="event-row">
                  <div className="event-left">
                    <div className="event-meta">
                      <div className="event-title">No tasks for this day.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
