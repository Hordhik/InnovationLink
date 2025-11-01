//
// FILE: Frontend/src/components/Portal/Profile/PublicStartupDock.jsx (New File)
//
// This component filters for and displays ONLY primary documents.
//

import React from 'react';
import * as startupDockApi from '../../../services/startupDockApi.js';
import { FileItem } from './Folder.jsx'; // Reuse the file row visual, but not the dropdown folder

// Helper component for a single file link
const PrimaryFileLink = ({ username, file }) => {
    if (!file) {
        return <p className="empty-text" style={{ padding: '2px 8px', fontStyle: 'italic' }}>No primary document set.</p>;
    }

    // Get the secure, tokenized URL
    const fileUrl = startupDockApi.getPublicFileViewerUrl(username, file.file_id);

    return (
        <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`file-item file-primary`}
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}
            title={file.name}
        >
            <FileItem name={file.name} />
            <span className="primary-badge">Primary</span>
        </a>
    );
};

const PublicStartupDock = ({ username, dockFiles }) => {
    // We only show the single primary file per category (if present)
    const pitchFiles = Array.isArray(dockFiles.pitch) ? dockFiles.pitch : [];
    const demoFiles = Array.isArray(dockFiles.demo) ? dockFiles.demo : [];
    const patentFiles = Array.isArray(dockFiles.patent) ? dockFiles.patent : [];

    const primaryPitch = pitchFiles.find(f => f.is_primary === 1 || f.is_primary === true) || null;
    const primaryDemo = demoFiles.find(f => f.is_primary === 1 || f.is_primary === true) || null;
    const primaryPatent = patentFiles.find(f => f.is_primary === 1 || f.is_primary === true) || null;

    return (
        <div className="public-dock-list">
            <div className="dock-section">
                <div className="dock-section-title">Pitch Deck</div>
                <PrimaryFileLink username={username} file={primaryPitch} />
            </div>

            <div className="dock-section">
                <div className="dock-section-title">Project Demo</div>
                <PrimaryFileLink username={username} file={primaryDemo} />
            </div>

            <div className="dock-section">
                <div className="dock-section-title">Patent / Copyright</div>
                <PrimaryFileLink username={username} file={primaryPatent} />
            </div>
        </div>
    );
};

export default PublicStartupDock;