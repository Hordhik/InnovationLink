import React, { useState, useEffect } from "react";
import { X, User, Calendar, Clock, Type, AlignLeft } from "lucide-react";
import "./AddItemModal.css"; // We'll add styles to your existing CSS

// Helper function to convert 24-hour time to 12-hour AM/PM format
const formatTo12Hour = (time24) => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  const hoursNum = parseInt(hours, 10);
  const ampm = hoursNum >= 12 ? "PM" : "AM";
  let hours12 = hoursNum % 12;
  if (hours12 === 0) hours12 = 12; // 0 should be 12 AM/PM
  return `${String(hours12).padStart(2, "0")}:${minutes} ${ampm}`;
};

// Helper function to get a default time (e.g., next hour)
const getDefaultTime = () => {
  const now = new Date();
  now.setHours(now.getHours() + 1);
  now.setMinutes(0);
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

// Helper to get today's date in YYYY-MM-DD
const getTodayISO = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// Helper to get current time HH:MM in 24h
const getNowHHMM = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

// Helper to convert 12-hour time to 24-hour format
const convertTo24Hour = (time12) => {
  if (!time12) return "";
  const [timePart, ampm] = time12.split(" ");
  let [hours, minutes] = timePart.split(":");
  hours = parseInt(hours, 10);
  
  if (ampm === "PM" && hours !== 12) {
    hours += 12;
  } else if (ampm === "AM" && hours === 12) {
    hours = 0;
  }
  
  return `${String(hours).padStart(2, "0")}:${minutes}`;
};

const AddItemModal = ({ onClose, onSave, selectedDate, editingEvent }) => {
  const [title, setTitle] = useState(editingEvent?.title || "");
  const [date, setDate] = useState(selectedDate);
  const [time, setTime] = useState(editingEvent ? convertTo24Hour(editingEvent.time) : getDefaultTime());
  const [timeMin, setTimeMin] = useState(() => (selectedDate === getTodayISO() ? getNowHHMM() : "00:00"));
  const [description, setDescription] = useState(editingEvent?.description || "");
  const [isUserEvent, setIsUserEvent] = useState(editingEvent?.user !== undefined ? editingEvent.user : true);

  // Update date in form if selectedDate on calendar changes
  useEffect(() => {
    setDate(selectedDate);
  }, [selectedDate]);

  // Update time min when date changes; if date is today, past times disabled
  useEffect(() => {
    const today = getTodayISO();
    const newMin = date === today ? getNowHHMM() : "00:00";
    setTimeMin(newMin);
    // If current time is before newMin (when switching to today), nudge it forward
    if (time < newMin) {
      setTime(newMin);
    }
  }, [date, time]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !date || !time) {
      alert("Please fill in at least Title, Date, and Time.");
      return;
    }

    const newEvent = {
      title,
      description,
      time: formatTo12Hour(time),
      user: isUserEvent,
      done: editingEvent?.done || false, // Preserve done status when editing
    };

    onSave(date, newEvent);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editingEvent ? "Edit Schedule Item" : "Add New Schedule Item"}</h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title"><Type size={14} /> Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Product roadmap review"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date"><Calendar size={14} /> Date</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={getTodayISO()}
                className="date-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="time"><Clock size={14} /> Time</label>
              <input
                type="time"
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                min={timeMin}
                max="23:59"
                className={date === getTodayISO() ? "time-input has-cutoff" : "time-input"}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description"><AlignLeft size={14} /> Description (Optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              placeholder="e.g., Review Q4 roadmap items and dependencies."
            ></textarea>
          </div>

          <div className="form-group-checkbox">
            <input
              type="checkbox"
              id="userEvent"
              checked={isUserEvent}
              onChange={(e) => setIsUserEvent(e.target.checked)}
            />
            <label htmlFor="userEvent">
              <User size={14} /> Assign this event to me
            </label>
          </div>

          <div className="modal-footer">
            <button type="button"  onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save">
              {editingEvent ? "Update Event" : "Save Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;