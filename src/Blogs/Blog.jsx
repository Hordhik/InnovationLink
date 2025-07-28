import React from 'react'
import './Blog.css';
import { useParams } from 'react-router-dom';
import { getBlogById } from './blogData';
import calendarIcon from '../assets/Events/calendar.svg';
import profileIcon from '../assets/Blogs/profile.svg';
import BlogCardShort from './BlogCardShort';
import { blogData } from './blogData';


const Blog = () => {
  const { id } = useParams();
  
  const blog = getBlogById(id);

  if (!blog) {
    return (
      <div className="blog">
        <h1>Blog not found</h1>
        <p>The blog post you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="blog-page">
        <div className="empty"></div>
        <div className="blog">
            <div className="blog-header">
                <p className="blog-title">{blog.title}</p>
                <div className="blog-meta">
                <div className="blog-date"><img src={calendarIcon} alt="" /><p>{blog.date}</p></div>
                <div className="blog-author"><img src={profileIcon} alt="" /> <p>By {blog.user}</p></div>
                </div>
            </div>
                {blog.img && <img src={blog.img} alt={blog.title} className="blog-hero-image" />}
            <div className="blog-content">
                <div className="blog-full-content">
                {blog.fullContent.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
                </div>
            </div>
        </div>
        <div className="most-viewd">
            <p className='title'>Most Popular</p>
            {blogData.slice(0, 3).map((blog) => (
                <BlogCardShort key={blog.id} blog={blog} />
            ))}
            {blogData.slice(0, 3).map((blog) => (
                <BlogCardShort key={blog.id} blog={blog} />
            ))}
        </div>
    </div>
  )
}

export default Blog;
