import React, { useState } from "react";
import { ChevronDown, ChevronRight, Folder as FolderIcon, File } from "lucide-react";
import "./Folder.css";

const Folder = ({ name, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleFolder = () => setIsOpen(!isOpen);

  return (
    <div className="folder">
      <div className="folder-header" onClick={toggleFolder}>
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <FolderIcon size={18} className="folder-icon" />
        <span className="folder-name">{name}</span>
      </div>

      {isOpen && <div className="folder-content">{children}</div>}
    </div>
  );
};

export const FileItem = ({ name }) => (
  <div className="file-item">
    <File size={16} className="file-icon" />
    <span>{name}</span>
  </div>
);

export default Folder;
