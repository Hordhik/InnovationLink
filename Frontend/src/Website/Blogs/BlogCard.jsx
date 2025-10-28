// src/Website/Blogs/BlogCard.jsx
import React from 'react';
import './BlogCard.css';
import { useNavigate, useLocation } from 'react-router-dom';
import calendarIcon from '../../assets/Events/calendar.svg';
import profileIcon from '../../assets/Blogs/profile.svg';

const BlogCard = ({ blog, className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();

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

  // Helper to format date, checking if it exists first
  const formattedDate = blog.created_at
    ? new Date(blog.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : '...';

  return (
    <div className={`blog-card ${className}`} onClick={() => handleBlogClick(blog.id)} style={{ cursor: 'pointer' }}>
      <div className="blog-content">
        <p className="blog-title">{blog.title}</p>

        {/* Use subtitle from API as the description */}
        {blog.subtitle && (
          <p className="blog-description">{blog.subtitle}</p>
        )}

        <div className="blog-details">
          <div className="blog-detail author-detail">
            <img src={profileIcon} alt="Profile Icon" />
            {/* Use username from API */}
            <p>{blog.username || '...'}</p>
          </div>
          <div className="blog-detail date-detail">
            <img src={calendarIcon} alt="Calendar Icon" />
            {/* Use formatted created_at from API */}
            <p>{formattedDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;

