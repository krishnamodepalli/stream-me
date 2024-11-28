"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";

const Page: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("video", file);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadStatus(data.message);
      } else {
        setUploadStatus("Failed to upload video.");
      }
    } catch (error) {
      setUploadStatus("An error occurred while uploading.");
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mkv", ".avi", ".mov", ".wmv", ".flv"],
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen flex-col bg-gray-100 dark:bg-gray-900 transition-colors">
      <div
        {...getRootProps()}
        className={`w-full max-w-xl p-10 border-4 border-dashed rounded-lg cursor-pointer 
                      transition-colors ease-in-out duration-300
                      ${isDragActive ? "border-blue-500 bg-blue-100 dark:bg-blue-800" : "border-gray-400 bg-white dark:bg-gray-800"}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          {isDragActive ? (
            <p className="text-blue-500 dark:text-blue-300">
              Drop the video file here...
            </p>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">
              Drag & drop a video file here, or click to select one
            </p>
          )}
        </div>
      </div>

      {file && (
        <div className="mt-6 text-center">
          <p className="text-gray-700 dark:text-gray-200">{file.name}</p>
          <button
            onClick={handleUpload}
            className="px-5 py-3 mt-4 font-semibold text-white bg-blue-500 rounded-lg 
                             hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-600 
                             focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
          >
            Upload
          </button>
          {uploadStatus && (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              {uploadStatus}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Page;
