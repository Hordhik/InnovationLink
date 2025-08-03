import React, { useState } from 'react'
import './Blogs.css';
import BlogCard from './BlogCard';
import BlogCardShort from './BlogCardShort';
import { blogData } from './blogData';
import { useLocation, Link } from 'react-router-dom';

const Blogs = () => {
  const options = [
    "Startup Advice", "Scaling", "Networking", "Building MVP", 
    "Idea Validation"
  ];
  const [selectedOption, setSelectedOption] = useState(null);
  // const { id } = useParams();
  const location = useLocation();
  
  // Check if we're in any portal view (any project)
  // More robust detection: check if URL has format /{project}/blogs
  const pathParts = location.pathname.split('/');
  const isPortalView = pathParts.length >= 3 && pathParts[2] === 'blogs' && pathParts[1] !== 'blogs';
  
  // Extract current project from URL
  const currentProject = pathParts[1] || '';
    // const blog = getBlogById(id);
  

  // Function to handle clicking a state option
  const handleOptionClick = (option) => {
    // If the clicked option is already selected, unselect it. Otherwise, select it.
    setSelectedOption(prevSelectedOption => prevSelectedOption === option ? null : option);
  };

  if (isPortalView) {
    return (
      <div className="portal-blogs-page">
        <div className="portal-blog-header">
          {/* These buttons are styled to look like your image.
              Using <Link> is better for navigation in React Router. */}
          <Link to={`/${currentProject}/my-blogs`} className="portal-button">
            Your Blogs
          </Link>
          <Link to={`/${currentProject}/blogs/new`} className="portal-button new-blog">
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
            {blogData.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
            {blogData.map((blog) => (
              <BlogCard key={`duplicate-${blog.id}`} blog={blog} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="Blogs">
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
        <div className="blog-list">
            {blogData.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
            ))}
            {blogData.map((blog) => (
                <BlogCard key={`website-duplicate-${blog.id}`} blog={blog} />
            ))}
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

export default Blogs