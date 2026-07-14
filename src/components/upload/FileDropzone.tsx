'use client';

import { useCallback, useState } from 'react';
import Button from '@/components/ui/Button';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
}

const FileDropzone = ({ onFileSelect }: FileDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
        isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="text-gray-400 mb-4">
        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      <p className="text-gray-600 mb-4">
        Drag and drop your resume, transcript, or certificate here
      </p>
      <p className="text-sm text-gray-500 mb-4">or</p>
      <label>
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={handleFileInput}
        />
        <Button variant="outline">Browse Files</Button>
      </label>
      <p className="text-xs text-gray-500 mt-4">PDF, DOCX, or TXT (max 10MB)</p>
    </div>
  );
};

export default FileDropzone;
