import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Modal from "react-modal"; // Import Modal
import { getStoredUser } from "../../auth.js";
import "./AddBlog.css";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

// Import our new API function (name corrected)
import { createPost } from "../../services/postApi";

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

  // Loading/Error state
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [imageResizeEnabled, setImageResizeEnabled] = useState(false);

  // Try to register image resize module dynamically (works if dependency is installed)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Get Quill constructor from react-quill-new or fallback to global
        const rq = await import("react-quill-new");
        const QuillRef = rq?.Quill || (await import("quill")).default || window.Quill;
        if (!QuillRef) return;

        let ImageResize = null;
        try {
          // Preferred for Quill v2
          const mod = await import("quill-image-resize-module-react");
          ImageResize = mod?.default || mod;
        } catch (_) {
          try {
            // Fallback for Quill v1-style module
            const mod = await import("quill-image-resize-module");
            ImageResize = mod?.default || mod;
          } catch (_) { /* no module available */ }
        }

        if (ImageResize) {
          QuillRef.register("modules/imageResize", ImageResize);
          if (mounted) setImageResizeEnabled(true);
        }
      } catch (e) {
        // silent fallback – editor still works without resize
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Custom toolbar options
  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, 4, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["link", "image"],
      ["clean"],
    ],
    ...(imageResizeEnabled ? { imageResize: { modules: ["Resize", "DisplaySize", "Toolbar"] } } : {}),
  }), [imageResizeEnabled]);

  const formats = [
    "header", "bold", "italic", "underline", "strike", "blockquote",
    "list", "bullet", "indent", "link", "image",
  ];

  // --- Button Handlers ---

  const handleCancel = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleOpenModal = () => {
    // Clear any previous non-modal errors
    setErrorMessage("");
    if (!title || !content) {
      // Set an error message instead of using alert()
      setErrorMessage("Please add a title and some content before publishing.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrorMessage(""); // Clear error on close
  };

  const handleFinalPublish = async () => {
    setIsPublishing(true);
    setErrorMessage("");

    const postData = {
      title,
      subtitle,
      content, // The HTML content from ReactQuill
      tags: tags.split(",").map(tag => tag.trim()).filter(Boolean), // Convert string to array
      // We are not sending schedule info yet, but backend could be updated for it
    };

    try {
      // Use the API function (name corrected)
      const response = await createPost(postData);

      console.log("Post created successfully:", response);

      // After successful API call, close modal and navigate
      handleCloseModal();

      // Navigate to the new post, detecting if we are in a portal
      const user = getStoredUser();
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      const firstSegment = pathParts[0];
      const isPortalView = firstSegment === 'S' || firstSegment === 'I';

      if (isPortalView) {
        navigate(`/${firstSegment}/blog/${response.postId}`);
      } else {
        navigate(`/blog/${response.postId}`);
      }

    } catch (error) {
      console.error("Failed to create post:", error);
      setErrorMessage(error.message || "Failed to publish post. Please try again.");
    } finally {
      setIsPublishing(false);
    }
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

      {/* Non-modal error message for validation */}
      {/* --- FIX: Removed invalid WARNING tag --- */}
      {errorMessage && !isModalOpen && (
        <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>
          {errorMessage}
        </p>
      )}

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
              // --- FIX: Corrected typo 'e.g.' to 'e' ---
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
              // --- FIX: Corrected typo 'e.g.' to 'e' ---
              onChange={(e) => setScheduleTime(e.target.value)}
            />
          </div>
        )}

        {/* Modal error message for publish failure */}
        {errorMessage && (
          <p style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</p>
        )}

        <div className="modal-actions">
          <button className="modal-cancel-button" onClick={handleCloseModal} disabled={isPublishing}>
            Cancel
          </button>
          <button className="modal-publish-button" onClick={handleFinalPublish} disabled={isPublishing}>
            {isPublishing ? "Publishing..." : (isScheduled ? "Schedule Post" : "Publish Now")}
          </button>
        </div>
      </Modal>
    </div>
  );
}

