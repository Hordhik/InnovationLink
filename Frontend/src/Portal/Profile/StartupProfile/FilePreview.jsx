// File: FilePreview.jsx
import React, { useRef, useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import workerSrc from "pdfjs-dist/legacy/build/pdf.worker.mjs?url";
import "./FilePreview.css";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

/**
 * FilePreview Component (v2)
 * - Detects PDFs, images, videos, and links automatically
 * - Works for both File objects and plain URLs
 */
export default function FilePreview({ fileURL, fileType = "", width = 280 }) {

    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(280);

    useEffect(() => {
        if (containerRef.current) {
        const resizeObserver = new ResizeObserver(() => {
            setContainerWidth(containerRef.current.offsetWidth - 20);
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
        }
    }, []);

  if (!fileURL) {
    return <p className="placeholder-text">No file uploaded — click to upload.</p>;
  }

  // Detect file extension for fallback detection
  const ext = (fileURL.split(".").pop() || "").toLowerCase();

  // Normalize type
  const type =
    fileType ||
    (ext === "pdf"
      ? "application/pdf"
      : ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)
      ? "image"
      : ["mp4", "mov", "avi", "webm"].includes(ext)
      ? "video"
      : "");

  // --- PDF Preview ---
  if (type.includes("pdf")) {
    return (
      <div ref={containerRef} className="pdf-preview">
        <Document
            file={fileURL}
            onLoadError={(err) => console.error("PDF load error:", err)}
            loading={<p>Loading PDF...</p>}
            error={<p className="placeholder-text">Failed to load PDF file.</p>}
            >

          <Page
            pageNumber={1}
            scale={0.8}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            />

        </Document>
      </div>
    );
  }

  // --- Image Preview ---
  if (type.startsWith("image")) {
    return <img src={fileURL} alt="File Preview" className="doc-thumbnail" />;
  }

  // --- Video Preview ---
  if (type.startsWith("video")) {
    return (
      <video className="video-preview" controls>
        <source src={fileURL} type={type || "video/mp4"} />
        Your browser does not support video playback.
      </video>
    );
  }

  // --- YouTube/Vimeo Embeds ---
  if (fileURL.includes("youtube") || fileURL.includes("vimeo")) {
    return (
      <iframe
        className="video-preview"
        src={fileURL}
        title="Embedded Video"
        frameBorder="0"
        allowFullScreen
      />
    );
  }

  // --- Fallback link ---
  return (
    <a
      href={fileURL}
      target="_blank"
      rel="noopener noreferrer"
      className="pitch-link"
    >
      📄 View uploaded file
    </a>
  );
}
