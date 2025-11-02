import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "react-modal";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "./AddBlog.css"; // ✅ Reuse the exact AddBlog styling

import { getPostById, updatePost } from "../../services/postApi.js";
import { getStoredUser } from "../../auth.js";

Modal.setAppElement("#root");

export default function EditBlogPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Blog data states
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Modal and publishing states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // --- Fetch existing blog data ---
   useEffect(() => {
    const fetchBlog = async () => {
        try {
        const data = await getPostById(id);
        const post = data.post; // ✅ unwrap the 'post' object

        setTitle(post.title || "");
        setSubtitle(post.subtitle || "");
        setContent(post.content || "");
        setTags(post.tags || []);
        setIsLoaded(true);
        } catch (error) {
        console.error("Failed to load blog:", error);
        setErrorMessage("Failed to load blog content.");
        }
    };

    fetchBlog();
    }, [id]);


  // --- Toolbar setup (same as AddBlog) ---
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
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
  ];

  const handleCancel = () => navigate(-1);

  const handleOpenModal = () => {
    if (!title || !content) {
      setErrorMessage("Please add a title and some content before saving.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrorMessage("");
  };

  const handleFinalSave = async () => {
    setIsUpdating(true);
    setErrorMessage("");

    const updatedPost = {
      title,
      subtitle,
      content,
      tags: tags.map((tag) => tag.trim()).filter(Boolean),
    };

    try {
      await updatePost(id, updatedPost);
      handleCloseModal();

      const user = getStoredUser();
      const pathParts = window.location.pathname.split("/").filter(Boolean);
      const firstSegment = pathParts[0];
      const isPortalView = firstSegment === "S" || firstSegment === "I";

      if (isPortalView) {
        navigate(`/${firstSegment}/blogs?filter=mine`);
      } else {
        navigate("/blogs");
      }
    } catch (error) {
      console.error("Failed to update post:", error);
      setErrorMessage(error.message || "Failed to update post. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isLoaded) {
    return <div style={{ textAlign: "center", padding: "2rem" }}>Loading blog...</div>;
  }

  return (
    <div className="add-blog-container">
      {/* Top Action Bar */}
      <div className="blog-actions-top">
        <button className="cancel-button" onClick={handleCancel}>
          Cancel
        </button>
        <button className="publish-button" onClick={handleOpenModal}>
          Save Changes
        </button>
      </div>

      {/* Error message */}
      {errorMessage && !isModalOpen && (
        <p style={{ color: "red", textAlign: "center", marginBottom: "15px" }}>
          {errorMessage}
        </p>
      )}

      {/* Inputs same as AddBlog */}
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
        placeholder="Edit your story..."
        className="custom-quill-editor"
      />

      {/* Modal for saving updates */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        className="publish-modal"
        overlayClassName="publish-modal-overlay"
        contentLabel="Edit Options"
      >
        <h2>Edit Options</h2>

        <div className="modal-form-group">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            className="modal-input"
            value={tags.join(", ")}
            onChange={(e) =>
              setTags(e.target.value.split(",").map((tag) => tag.trim()))
            }
            placeholder="e.g., react, innovation, startups"
          />
        </div>

        {errorMessage && (
          <p style={{ color: "red", textAlign: "center" }}>{errorMessage}</p>
        )}

        <div className="modal-actions">
          <button className="modal-cancel-button" onClick={handleCloseModal}>
            Cancel
          </button>
          <button
            className="modal-publish-button"
            onClick={handleFinalSave}
            disabled={isUpdating}
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
