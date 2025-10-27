import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Modal from "react-modal"; // Import Modal
import { getStoredUser } from "../../auth.js";
import "./AddBlog.css";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

// Bind modal to your app element for accessibility
Modal.setAppElement("#root");

export default function AddBlog() {
  // Navigation
  const navigate = useNavigate();

  // Post content state
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tags, setTags] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("");

  // Custom toolbar options
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header", "bold", "italic", "underline", "strike", "blockquote",
    "list", "bullet", "indent", "link", "image",
  ];

  // --- Button Handlers ---

  const handleCancel = () => {
    // Navigate back to the /blogs page (adjust route if needed)
    navigate("/blogs");
  };

  const handleOpenModal = () => {
    // This function now just opens the modal
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFinalPublish = () => {
    // This is where you'll send all data to your backend
    const postData = {
      title,
      subtitle,
      content, // The HTML content from ReactQuill
      tags: tags.split(",").map(tag => tag.trim()), // Convert string to array
      isScheduled,
      scheduleTime: isScheduled ? scheduleTime : null,
      author: getStoredUser().username, // Example of adding auth'd user
    };

    console.log("PUBLISHING POST:", postData);

    // After successful API call, close modal and navigate
    handleCloseModal();
    // Optionally, navigate to the new post or back to blogs list
    // navigate(`/blog/${postData.id}`); // Example
    navigate("/blogs");
  };

  return (
    <div className="add-blog-container">
      {/* Top action bar */}
      <div className="blog-actions-top">
        <button className="cancel-button" onClick={handleCancel}>
          Cancel
        </button>
        <button className="publish-button" onClick={handleOpenModal}>
          Publish
        </button>
      </div>

      <input
        type="text"
        placeholder="Title"
        className="blog-title-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Subtitle (optional)"
        className="blog-subtitle-input"
        value={subtitle}
        onChange={(e) => setSubtitle(e.target.value)}
      />

      <ReactQuill
        theme="snow"
        value={content}
        onChange={setContent}
        modules={modules}
        formats={formats}
        placeholder="Start writing your story..."
        className="custom-quill-editor"
      />

      {/* --- Publish Options Modal --- */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        className="publish-modal"
        overlayClassName="publish-modal-overlay"
        contentLabel="Publish Options"
      >
        <h2>Publish Options</h2>

        <div className="modal-form-group">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            className="modal-input"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., react, innovation, startups"
          />
        </div>

        <div className="modal-form-group">
          <label className="modal-checkbox-label">
            <input
              type="checkbox"
              checked={isScheduled}
              onChange={(e) => setIsScheduled(e.target.checked)}
            />
            Schedule for later?
          </label>
        </div>

        {isScheduled && (
          <div className="modal-form-group">
            <label htmlFor="scheduleTime">Schedule Time</label>
            <input
              type="datetime-local"
              id="scheduleTime"
              className="modal-input"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
            />
          </div>
        )}

        <div className="modal-actions">
          <button className="modal-cancel-button" onClick={handleCloseModal}>
            Cancel
          </button>
          <button className="modal-publish-button" onClick={handleFinalPublish}>
            {isScheduled ? "Schedule Post" : "Publish Now"}
          </button>
        </div>
      </Modal>
    </div>
  );
}