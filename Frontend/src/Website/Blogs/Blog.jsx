import React, { useState, useEffect, useMemo } from 'react';
import './Blog.css';
import { useParams, useLocation } from 'react-router-dom';
import calendarIcon from '../../assets/Events/calendar.svg';
import profileIcon from '../../assets/Blogs/profile.svg';
import BlogCardShort from './BlogCardShort';

// --- API Imports ---
import { getPostById, getAllPosts } from '../../services/postApi';

const Blog = () => {
  const { id } = useParams();
  const location = useLocation();

  const [blog, setBlog] = useState(null);
  const [popularBlogs, setPopularBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isPortalView = useMemo(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const firstSegment = pathParts[0];
    return firstSegment === 'S' || firstSegment === 'I';
  }, [location.pathname]);

  useEffect(() => {
    const fetchBlogData = async () => {
      setLoading(true);
      setError(null);
      try {
        const postData = await getPostById(id);
        setBlog(postData.post);

        if (!isPortalView) {
          const allPostsData = await getAllPosts();
          setPopularBlogs(allPostsData.posts.filter(p => p.id !== parseInt(id)).slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching blog data:', err);
        setError(err.message || 'Failed to load post.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogData();
  }, [id, isPortalView]);

  if (loading) {
    return <div className="blog-page-portal"><p>Loading post...</p></div>;
  }

  if (error || !blog) {
    return (
      <div className="blog-page-portal">
        <h1>Blog not found</h1>
        <p>{error || "The blog post you're looking for doesn't exist."}</p>
      </div>
    );
  }

  const formattedDate = new Date(blog.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (isPortalView) {
    return (
      <div className="blog-page-portal">
        <div className="blog">
          <div className="blog-header">
            <p className="blog-title">{blog.title}</p>
            {blog.subtitle && <p className="blog-subtitle">{blog.subtitle}</p>}
            <div className="blog-meta">
              <div className="blog-date">
                <img src={calendarIcon} alt="" />
                <p>{formattedDate}</p>
              </div>
              <div className="blog-author">
                <img src={profileIcon} alt="" />
                <p>By {blog.username}</p>
              </div>
            </div>
          </div>

          <div className="blog-content">
            <div
              className="blog-full-content"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>
        </div>
      </div>
    );
  }

  // --- Public Website View ---
  return (
    <>
      {/* Floating back button (public blog detail) */}
      <button
        className="blog-back-btn"
        onClick={() => { if (window.history.length > 1) window.history.back(); else window.location.href = '/blogs'; }}
        aria-label="Go back"
      >
        ← Back
      </button>

      <div className="blog-page">
        <div className="empty"></div>
        <div className="blog">
          {/* Author bar */}
          <div className="blog-author-bar">
            <div className="blog-author-avatar" aria-hidden>
              {String(blog.username || '')
                .split(' ')
                .map(s => s[0])
                .filter(Boolean)
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
            <div className="blog-author-info">
              <div className="name-row">
                <span className="author-name">{blog.username}</span>
                <span className={`role-chip ${blog.userType === 'investor' ? 'investor' : 'startup'}`}>
                  {blog.userType === 'investor' ? 'Investor' : 'Startup'}
                </span>
              </div>
              <div className="date-row">
                <img src={calendarIcon} alt="" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>

          <div className="blog-header">
            <p className="blog-title">{blog.title}</p>
            {blog.subtitle && <p className="blog-subtitle">{blog.subtitle}</p>}
          </div>

          {/* Render the HTML content from ReactQuill */}
          <div className="blog-content">
            <div
              className="blog-full-content"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>
        </div>
        <div className="most-viewd">
          <p className='title'>Most Popular</p>
          {popularBlogs.map((popBlog) => (
            <BlogCardShort key={`popular-${popBlog.id}`} blog={popBlog} />
          ))}
        </div>
      </div>
    </>
  );
};

export default Blog;

