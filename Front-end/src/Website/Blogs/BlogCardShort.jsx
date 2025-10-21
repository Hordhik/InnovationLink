import React from 'react'
import './BlogCardShort.css';
import { useNavigate } from 'react-router-dom';

const BlogCardShort = ({ blog }) => {
  const navigate = useNavigate();

  const handleBlogClick = () => {
    navigate(`/blog/${blog.id}`);
  };

  return (
    <div className='BlogCardShort' onClick={handleBlogClick} style={{cursor: 'pointer'}}>
      <p className='blog-title'>{blog.title}</p>
      <p className='blog-meta'>{blog.date} • {blog.user}</p>
    </div>
  )
}

export default BlogCardShort