import React, { useMemo, useState } from 'react';
import './BlogCard.css';
import { useNavigate, useLocation } from 'react-router-dom';
import calendarIcon from '../../assets/Events/calendar.svg';
import profileIcon from '../../assets/Blogs/profile.svg';
import { deletePost } from '../../services/postApi.js';

// Helper: extract image + text preview
const extractPreview = (htmlString) => {
  if (!htmlString) return { imageHtml: null, text: '', lineClamp: 6 };

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const firstElement = doc.body.firstElementChild;
    let imageHtml = null;
    let imageNode = null;
    let lineClamp = 4;

    if (firstElement) {
      if (firstElement.tagName === 'IMG') {
        imageNode = firstElement;
      } else if (
        firstElement.tagName === 'P' &&
        firstElement.children.length === 1 &&
        firstElement.firstElementChild.tagName === 'IMG' &&
        (firstElement.textContent || '').trim().length === 0
      ) {
        imageNode = firstElement.firstElementChild;
      }
    }

    if (imageNode) {
      imageHtml = imageNode.outerHTML;
      const elementToRemove = imageNode.closest('p') || imageNode;
      elementToRemove.remove();
      lineClamp = 3;
    }

    const text = (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
    return { imageHtml, text, lineClamp };
  } catch (err) {
    console.error('Error parsing blog content:', err);
    return { imageHtml: null, text: 'Could not load preview.', lineClamp: 6 };
  }
};

const BlogCard = ({ blog, className = '', isOwner = false, onDelete }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBlogClick = (blogId) => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const firstSegment = pathParts[0]; // "S" or "I" or "blogs"
    const isPortalView = firstSegment === 'S' || firstSegment === 'I';

    if (isPortalView) {
      navigate(`/${firstSegment}/blog/${blogId}`);
    } else {
      navigate(`/blog/${blogId}`);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation(); // Prevent blog navigation
    const pathParts = location.pathname.split('/').filter(Boolean);
    const firstSegment = pathParts[0];
    navigate(`/${firstSegment}/edit-blog/${blog.id}`);
  };

  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    if (isDeleting) return;

    try {
      setIsDeleting(true);
      await deletePost(blog.id); // 🔥 API call
      onDelete?.(blog.id);       // Update UI immediately
    } catch (err) {
      console.error('Failed to delete blog:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = blog.created_at
    ? new Date(blog.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '...';

  const preview = useMemo(() => extractPreview(blog.content), [blog.content]);

  const descriptionStyle = {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: preview.lineClamp,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: '1.5em',
  };

  return (
    <div
      className={`blog-card ${className}`}
      onClick={() => handleBlogClick(blog.id)}
      style={{ cursor: 'pointer' }}
    >
      <div className="blog-content">
        <p className="blog-title">{blog.title}</p>

        {blog.subtitle && <p className="blog-subtitle">{blog.subtitle}</p>}

        {preview.imageHtml && (
          <div
            className="blog-card-preview-image"
            dangerouslySetInnerHTML={{ __html: preview.imageHtml }}
          />
        )}

        <p className="blog-description" style={descriptionStyle}>
          {preview.text || (!preview.imageHtml ? blog.subtitle : '')}
        </p>

        <div className="blog-details">
          <div className="blog-detail author-detail">
            <img src={profileIcon} alt="Profile Icon" />
            <p>{blog.username || '...'}</p>
          </div>
          <div className="blog-detail date-detail">
            <img src={calendarIcon} alt="Calendar Icon" />
            <p>{formattedDate}</p>
          </div>
        </div>

        {/* ✅ Show Edit/Delete only if user owns the blog */}
        {isOwner && (
          <div className="blog-actions">
            <button className="edit-btn" onClick={handleEditClick}>
              Edit
            </button>
            <button
              className="delete-btn"
              onClick={handleDeleteClick}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogCard;
