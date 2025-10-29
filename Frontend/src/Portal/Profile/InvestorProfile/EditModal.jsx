import React, { useState } from "react";

export default function EditModal({ field, data, onClose, onSave }) {
  const [value, setValue] = useState(
    Array.isArray(data[field]) ? data[field].join(", ") : data[field]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const newValue = Array.isArray(data[field])
      ? value.split(",").map((v) => v.trim())
      : value;
    onSave(field, newValue);
  };

  const fieldNames = {
    info: "Investor Info",
    about: "About Section",
    expertise: "Expertise",
    investLike: "Investment Preference",
    sectors: "Sectors Interested In",
    stages: "Stage Focus",
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit {fieldNames[field]}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          {field === "info" ? (
            <>
              <label>Name</label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => onSave("name", e.target.value)}
              />
              <label>Handle</label>
              <input
                type="text"
                value={data.handle}
                onChange={(e) => onSave("handle", e.target.value)}
              />
              <label>Title</label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => onSave("title", e.target.value)}
              />
              <label>Location</label>
              <input
                type="text"
                value={data.location}
                onChange={(e) => onSave("location", e.target.value)}
              />
            </>
          ) : (
            <>
              <label>{fieldNames[field]}</label>
              <textarea
                rows="5"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </>
          )}

          <div className="modal-buttons">
            <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
