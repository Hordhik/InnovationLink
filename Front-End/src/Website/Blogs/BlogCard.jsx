import React from 'react'
import './BlogCard.css';
import { useNavigate, useLocation } from 'react-router-dom';
import calendarIcon from '../../assets/Events/calendar.svg';
import profileIcon from '../../assets/Blogs/profile.svg';

const BlogCard = ({ blog }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleBlogClick = (blogId) => {
        // Check if we're in a portal context
        const pathParts = location.pathname.split('/');
        const isInPortal = pathParts.length >= 3 && pathParts[2] === 'blogs' && pathParts[1] !== 'blogs';
        
        if (isInPortal) {
            // Navigate within portal context
            const currentProject = pathParts[1];
            navigate(`/${currentProject}/blog/${blogId}`);
        } else {
            // Navigate to website blog
            navigate(`/blog/${blogId}`);
        }
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