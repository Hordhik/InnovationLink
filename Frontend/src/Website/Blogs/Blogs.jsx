import React, { useState } from 'react';
import './Blogs.css';
import BlogCard from './BlogCard';
import BlogCardShort from './BlogCardShort';
import { blogData } from './blogData';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getStoredUser } from '../../auth.js';

const Blogs = () => {
  const options = [
    "Startup Advice", "Scaling", "Networking", "Building MVP", 
    "Idea Validation"
  ];
  const [selectedOption, setSelectedOption] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const loginRequired = query.get('loginRequired') === 'true';
  const filter = query.get('filter');
  const showOnlyUserBlogs = filter === 'mine';

  const pathParts = location.pathname.split('/').filter(Boolean);
  const firstSegment = pathParts[0];
  const isPortalView = firstSegment === 'S' || firstSegment === 'I';

  const user = getStoredUser();

  const handleOptionClick = (option) => {
    setSelectedOption(prev => (prev === option ? null : option));
  };

  const handleToggleFilter = () => {
    if (showOnlyUserBlogs) {
      navigate(`/${firstSegment}/blogs`);
    } else {
      navigate(`/${firstSegment}/blogs?filter=mine`);
    }
  };

  // Filter logic
  const filteredBlogs = showOnlyUserBlogs && user
    ? blogData.filter(blog => blog.authorId === user.id)
    : blogData;

  // Filter by tag option (Trending filters)
  const finalBlogs = selectedOption
    ? filteredBlogs.filter(blog => blog.tags?.includes(selectedOption))
    : filteredBlogs;

  if (isPortalView) {
    return (
      <div className="portal-blogs-page">
        <div className="portal-blog-header">
          {/* Toggle Between All and Your Blogs */}
          <button 
            onClick={handleToggleFilter} 
            className={`portal-button toggle-filter ${showOnlyUserBlogs ? 'active' : ''}`}
          >
            {showOnlyUserBlogs ? 'All Blogs' : 'Your Blogs'}
          </button>
          
          {/* Add Blog */}
          <Link 
            to={user ? `/${firstSegment}/blogs/new` : '/auth/login'} 
            className="portal-button new-blog"
          >
            + Add Blog
          </Link>
        </div>

        <div className="Blogs portal-blogs-layout">
          <div className="filters">
            <div className="filter">
              <div className="filter-name">Trending</div>
              <div className="options">
                {options.map(option => (
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
            {finalBlogs.map(blog => (
              <BlogCard key={blog.id} blog={blog} />
            ))}

            {showOnlyUserBlogs && finalBlogs.length === 0 && (
              <p className="empty-blogs-message">
                You haven't posted any blogs yet. 
                <Link to={`/${firstSegment}/blogs/new`}> Create one!</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Public (non-portal) blog page ---
  return (
    <div className="Blogs">
      {loginRequired && !user && (
        <div className="login-banner">
          <strong>Want to post?</strong> Please log in to create and manage your blogs. You can still explore public posts.
        </div>
      )}

      <div className="filters">
        <div className="filter">
          <div className="filter-name">Trending</div>
          <div className="options">
            {options.map(option => (
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

      <div className="blog-list">
        {finalBlogs.map(blog => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>

      <div className="most-viewd">
        <p className="title">Most Popular</p>
        {blogData.slice(0, 3).map(blog => (
          <BlogCardShort key={`popular-${blog.id}`} blog={blog} />
        ))}
      </div>
    </div>
  );
};

export default Blogs;
