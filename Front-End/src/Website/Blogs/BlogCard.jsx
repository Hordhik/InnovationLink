import React from 'react'
import './BlogCard.css';
import { useNavigate } from 'react-router-dom';
import calendarIcon from '../../assets/Events/calendar.svg';
import profileIcon from '../../assets/Blogs/profile.svg';

const BlogCard = ({ blog }) => {
    const navigate = useNavigate();

    const handleBlogClick = (blogId) => {
        navigate(`/blog/${blogId}`);
    }

    return (
        <div className="blog-card" onClick={() => handleBlogClick(blog.id)} style={{cursor: 'pointer'}}>
            {blog.img && <img src={blog.img} alt="Blog Thumbnail" />}
            <div className="blog-content">
                <p className='blog-title'>{blog.title}</p>
                <div className="blog-details">
                    <div className="blog-detail">
                        <img src={profileIcon} alt="Profile Icon" />
                        <p>{blog.user}</p>
                    </div>
                    <div className="blog-detail">
                        <img src={calendarIcon} alt="Calendar Icon" />
                        <p>{blog.date}</p>
                    </div>
                </div>
                <p className='blog-description'>{blog.description}</p>
            </div>
        </div>
    )
}

export default BlogCard