import React, { useState, useEffect, useMemo } from 'react';
import './Blogs.css';
import BlogCard from './BlogCard';
import BlogCardShort from './BlogCardShort';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getStoredUser } from '../../auth.js';

// Import our new API functions
import { getAllPosts, getMyPosts } from '../../services/postApi';

const Blogs = () => {
  const options = [
    "Startup Advice", "Scaling", "Networking", "Building MVP",
    "Idea Validation"
  ];

  // State for fetched blogs
  const [blogs, setBlogs] = useState([]);
  const [popularBlogs, setPopularBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filters
  const [selectedOption, setSelectedOption] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Memoize user only for display purposes or initial checks if needed elsewhere
  const user = useMemo(() => getStoredUser(), []);

  // Memoize URL-derived values
  const { isPortalView, showOnlyUserBlogs, loginRequired, firstSegment } = useMemo(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const segment = pathParts[0] || '';
    const isPortal = segment === 'S' || segment === 'I';

    const query = new URLSearchParams(location.search);
    const filter = query.get('filter');
    const showMine = filter === 'mine';
    const needsLogin = query.get('loginRequired') === 'true';

    return { isPortalView: isPortal, showOnlyUserBlogs: showMine, loginRequired: needsLogin, firstSegment: segment };
  }, [location.pathname, location.search]);

  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let response;
        if (isPortalView && showOnlyUserBlogs) {
          // --- FIX: Removed user check here. Let the API handle auth ---
          // If the user isn't logged in, getMyPosts() will fail with 401
          response = await getMyPosts();
        } else {
          // Everyone can see all posts
          response = await getAllPosts();
        }
        setBlogs(response.posts);

        // Set popular blogs (e.g., first 3)
        if (!isPortalView) {
          setPopularBlogs(response.posts.slice(0, 3));
        }

      } catch (err) {
        console.error("Failed to fetch blogs:", err);
        // --- FIX: Check for specific auth error and redirect ---
        if (err.message && (err.message.includes('401') || err.message.toLowerCase().includes('unauthorized'))) {
          console.log("Authorization error detected, redirecting to login.");
          navigate('/auth/login'); // Redirect to login on auth failure
        } else {
          setError(err.message || 'Failed to fetch blogs.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
    // --- FIX: Removed `user` and `Maps` from dependencies ---
    // Effect should re-run only when the *view* changes
  }, [isPortalView, showOnlyUserBlogs]); // Removed navigate


  const handleOptionClick = (option) => {
    setSelectedOption(prev => (prev === option ? null : option));
  };

  const handleToggleFilter = () => {
    if (showOnlyUserBlogs) {
      navigate(`/${firstSegment}/blogs`);
    } else {
      // --- FIX: Removed user check. Navigate directly. ---
      // If user isn't logged in, the useEffect will catch the 401 error on fetch.
      navigate(`/${firstSegment}/blogs?filter=mine`);
    }
  };

  // --- Client-side filtering ---
  const finalBlogs = selectedOption
    ? blogs.filter(blog => blog.tags?.includes(selectedOption))
    : blogs;

  // --- Render Loading/Error ---
  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading blogs...</div>;
  }

  // Only show generic error if not loading (prevents flash of error during load)
  if (error && !isLoading) {
    return <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>Error: {error}</div>;
  }


  if (isPortalView) {
    // Check user status *here* just before rendering the portal view
    // This uses the latest user status potentially updated by auth context/login
    const currentUser = getStoredUser(); // Get potentially updated user status
    if (!currentUser) {
      navigate('/auth/login');
      return <div style={{ textAlign: 'center', padding: '2rem' }}>Redirecting to login...</div>;
    }

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
            to={`/${firstSegment}/blogs/new`}
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
            {finalBlogs.length > 0 ? (
              finalBlogs.map(blog => (
                <BlogCard key={blog.id} blog={blog} />
              ))
            ) : (
              <p className="empty-blogs-message">
                {showOnlyUserBlogs
                  ? <>You haven't posted any blogs yet. <Link to={`/${firstSegment}/blogs/new`}>Create one!</Link></>
                  : "No blogs found."
                }
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
      {loginRequired && !user && ( // This 'user' is the memoized one, okay for this banner
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
        {finalBlogs.length > 0 ? (
          finalBlogs.map(blog => (
            <BlogCard key={blog.id} blog={blog} />
          ))
        ) : (
          <p className="empty-blogs-message">No blogs found matching your criteria.</p>
        )}
      </div>

      <div className="most-viewd">
        <p className="title">Most Popular</p>
        {popularBlogs.map(blog => (
          <BlogCardShort key={`popular-${blog.id}`} blog={blog} />
        ))}
      </div>
    </div>
  );
};

export default Blogs;

