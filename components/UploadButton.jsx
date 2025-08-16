"use client";

import { useRef } from "react";

export default function UploadButton({ onFileSelect, accept }) {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      onFileSelect(event.target.files[0]);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700"
      >
        Upload File
      </button>
      <input
        type="file"
        accept={accept}
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
