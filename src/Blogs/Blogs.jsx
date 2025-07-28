import React, { useState } from 'react'
import './Blogs.css';
import BlogCard from './BlogCard';
import BlogCardShort from './BlogCardShort';
import { blogData } from './blogData';

const Blogs = () => {
    const options = [
  "Startup Advice", "Scaling", "Networking", "Building MVP", 
  "Idea Validation"
];
const [selectedOption, setSelectedOption] = useState(null);

  // Function to handle clicking a state option
  const handleOptionClick = (option) => {
    // If the clicked option is already selected, unselect it. Otherwise, select it.
    setSelectedOption(prevSelectedOption => prevSelectedOption === option ? null : option);
  };

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
                <BlogCard key={blog.id} blog={blog} />
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