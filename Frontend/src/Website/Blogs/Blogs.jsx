import React, { useState } from 'react'
import './Blogs.css';
import BlogCard from './BlogCard';
import BlogCardShort from './BlogCardShort';
import { blogData } from './blogData';
import { useLocation, Link } from 'react-router-dom';
import { getStoredUser } from '../../auth.js';

const Blogs = () => {
  const options = [
    "Startup Advice", "Scaling", "Networking", "Building MVP", 
    "Idea Validation"
  ];
  const [selectedOption, setSelectedOption] = useState(null);
  // const { id } = useParams();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const loginRequired = query.get('loginRequired') === 'true';
    const pathParts = location.pathname.split('/').filter(Boolean);
  const firstSegment = pathParts[0]; // "S", "I", or "blogs"
  const isPortalView = firstSegment === 'S' || firstSegment === 'I';
  // Function to handle clicking a state option
  const handleOptionClick = (option) => {
    // If the clicked option is already selected, unselect it. Otherwise, select it.
    setSelectedOption(prevSelectedOption => prevSelectedOption === option ? null : option);
  };

  // For now, don't persist blogs locally; rely on static blogData or backend later
  const combinedBlogs = [...blogData];

  const user = getStoredUser();

  if (isPortalView) {
    return (
      <div className="portal-blogs-page">
        <div className="portal-blog-header">
          {/* These buttons are styled to look like your image.
              Using <Link> is better for navigation in React Router. */}
          <Link to={`/${firstSegment}/blogs`} className="portal-button">
            Your Blogs
          </Link>
          <Link to={user ? `/${firstSegment}/blogs` : '/auth/login'} className="portal-button new-blog">
            + Add Blog
          </Link>
        </div>

        <div className="Blogs portal-blogs-layout">
          <div className="filters">
            {/* State Filter */}
            <div className="filter">
              <div className="filter-name">Trending</div>
              <div className="options">
                {options.map((option) => (
                  <div
                    key={option}
                    className={`option ${selectedOption === option ? 'active' : ''}`}
                    onClick={() => handleOptionClick(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="blog-list portal-blog-list">
            {combinedBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="Blogs">
      {loginRequired && !user && (
        <div className="login-banner">
          <strong>Want to post?</strong> Please log in to create and manage your blogs. You can still explore public posts.
        </div>
      )}
       <div className="filters">
        {/* State Filter */}
        <div className="filter">
          <div className="filter-name">Trending</div>
          <div className="options">
            {options.map((option) => (
              <div
                key={option}
                className={`option ${selectedOption === option ? 'active' : ''}`}
                onClick={() => handleOptionClick(option)}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
      </div>
    <div style={{display: 'flex', justifyContent:'flex-end', marginBottom: 12}}>
      <Link to={getStoredUser() ? '/blogs' : '/auth/login?redirect=/blogs&loginRequired=true'} className="portal-button new-blog">+ Add Blog</Link>
    </div>
    <div className="blog-list">
      {combinedBlogs.map((blog) => (
        <BlogCard key={blog.id} blog={blog} />
      ))}
        </div>
        <div className="most-viewd">
            <p className='title'>Most Popular</p>
      {combinedBlogs.slice(0, 3).map((blog) => (
        <BlogCardShort key={`popular-${blog.id}`} blog={blog} />
      ))}
        </div>
    </div>
  )
}

export default Blogs