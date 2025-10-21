// src/Website/Blogs/BlogCard.jsx
import React from 'react';
import './BlogCard.css';
import { useNavigate, useLocation } from 'react-router-dom';
import calendarIcon from '../../assets/Events/calendar.svg';
import profileIcon from '../../assets/Blogs/profile.svg';

const BlogCard = ({ blog, hideMeta = false, hideImage = false, clampLines, className = '' }) => {
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

  const descStyle = {};
  if (typeof clampLines === 'number' && clampLines > 0) {
    Object.assign(descStyle, {
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: clampLines,
      overflow: 'hidden',
    });
  }

  return (
    <div className={`blog-card ${className}`} onClick={() => handleBlogClick(blog.id)} style={{ cursor: 'pointer' }}>
      {!hideImage && blog.img && <img src={blog.img} alt="Blog Thumbnail" />}
      <div className="blog-content">
        <p className="blog-title">{blog.title}</p>
        <p className="blog-description" style={descStyle}>{blog.description}</p>
        {!hideMeta && (
          <div className="blog-details">
            <div className="blog-detail author-detail">
              <img src={profileIcon} alt="Profile Icon" />
              <p>{blog.user}</p>
            </div>
            <div className="blog-detail date-detail">
              <img src={calendarIcon} alt="Calendar Icon" />
              <p>{blog.date}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogCard;
