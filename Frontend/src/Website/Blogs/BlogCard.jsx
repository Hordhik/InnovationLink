// src/Website/Blogs/BlogCard.jsx
import React, { useMemo } from 'react';
import './BlogCard.css';
import { useNavigate, useLocation } from 'react-router-dom';
import calendarIcon from '../../assets/Events/calendar.svg';
import profileIcon from '../../assets/Blogs/profile.svg';

/**
 * Parses an HTML string to extract a preview.
 * @param {string} htmlString - The HTML content of the blog post.
 * @returns {{imageHtml: string|null, text: string, lineClamp: number}}
 */
const extractPreview = (htmlString) => {
  if (!htmlString) {
    return { imageHtml: null, text: '', lineClamp: 6 };
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const firstElement = doc.body.firstElementChild;

    let imageHtml = null;
    let lineClamp = 6; // Default to 6 lines
    let imageNode = null;

    // --- NEW LOGIC ---
    // Check if the first element is an image OR
    // if it's a paragraph that *only* contains an image.
    if (firstElement) {
      if (firstElement.tagName === 'IMG') {
        imageNode = firstElement;
      } else if (
        firstElement.tagName === 'P' &&
        firstElement.children.length === 1 &&
        firstElement.firstElementChild.tagName === 'IMG' &&
        (firstElement.textContent || '').trim().length === 0
      ) {
        // This is a <p> tag that only wraps an <img>
        imageNode = firstElement.firstElementChild;
      }
    }
    // --- END NEW LOGIC ---

    if (imageNode) {
      imageHtml = imageNode.outerHTML;
      // Remove the parent paragraph (if it exists) or the image itself
      const elementToRemove = imageNode.closest('p') || imageNode;
      elementToRemove.remove();
      lineClamp = 4; // Show 4 lines of text if there's an image
    }

    // Get all remaining text content from the parsed HTML
    const text = doc.body.textContent || "";

    // Clean up whitespace (replace multiple newlines/spaces with a single space)
    const cleanedText = text.replace(/\s+/g, ' ').trim();

    return { imageHtml, text: cleanedText, lineClamp };

  } catch (error) {
    console.error("Error parsing blog content for preview:", error);
    // Fallback in case of parsing error
    return { imageHtml: null, text: 'Could not load preview.', lineClamp: 6 };
  }
};


const BlogCard = ({ blog, className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBlogClick = (blogId) => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const firstSegment = pathParts[0]; // "S" or "I" or "blogs"
    const isPortalView = firstSegment === 'S' || firstSegment === 'I';

    if (isPortalView) {
      navigate(`/${firstSegment}/blog/${blogId}`);
    } else {
      navigate(`/blog/${blogId}`);
    }
  };

  // Helper to format date
  const formattedDate = blog.created_at
    ? new Date(blog.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : '...';

  // Use useMemo to parse the HTML content only when the blog prop changes
  const preview = useMemo(() => extractPreview(blog.content), [blog.content]);

  // Dynamic CSS style for line clamping
  // This automatically handles short content: if the text is less than
  // 'lineClamp' lines, it will just show the text and not add empty space.
  const descriptionStyle = {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: preview.lineClamp,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: '1.5em', // Ensure consistent line height
  };

  return (
    <div className={`blog-card ${className}`} onClick={() => handleBlogClick(blog.id)} style={{ cursor: 'pointer' }}>


      <div className="blog-content">
        <p className="blog-title">{blog.title}</p>

        {/* 2. Display the subtitle below the title */}
        {blog.subtitle && (
          <p className="blog-subtitle">{blog.subtitle}</p>
        )}

        {/* 1. Render the extracted image if it exists */}
        {preview.imageHtml && (
          <div
            className="blog-card-preview-image"
            // We use dangerouslySetInnerHTML to render the <img> tag
            dangerouslySetInnerHTML={{ __html: preview.imageHtml }}
          />
        )}
        {/* 3. Render the truncated text preview */}
        <p className="blog-description" style={descriptionStyle}>
          {/* Fallback to subtitle if text content is empty and no image was shown */}
          {preview.text || (!preview.imageHtml ? blog.subtitle : '')}
        </p>

        <div className="blog-details">
          <div className="blog-detail author-detail">
            <img src={profileIcon} alt="Profile Icon" />
            <p>{blog.username || '...'}</p>
          </div>
          <div className="blog-detail date-detail">
            <img src={calendarIcon} alt="Calendar Icon" />
            <p>{formattedDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;

