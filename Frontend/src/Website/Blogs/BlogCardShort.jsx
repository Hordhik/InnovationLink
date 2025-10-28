import React from 'react'
import './BlogCardShort.css';
import { useNavigate } from 'react-router-dom';

const BlogCardShort = ({ blog }) => {
  const navigate = useNavigate();

  const handleBlogClick = () => {
    // Note: This assumes BlogCardShort is only used on the public site.
    navigate(`/blog/${blog.id}`);
  };

  // Helper to format date, checking if it exists first
  const formattedDate = blog.created_at
    ? new Date(blog.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', // e.g., "Oct"
      day: 'numeric',
    })
    : '...';

  return (
    <div className='BlogCardShort' onClick={handleBlogClick} style={{ cursor: 'pointer' }}>
      <p className='blog-title'>{blog.title}</p>
      {/* Use username and formatted created_at from API */}
      <p className='blog-meta'>{formattedDate} • {blog.username || '...'}</p>
    </div>
  )
}

export default BlogCardShort

