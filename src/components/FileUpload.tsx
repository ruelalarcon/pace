import React, { useRef } from 'react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  accept?: string;
  label?: string;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileUpload, 
  accept = "*/*", 
  label = "Choose File",
  className = ""
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`file-upload ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="file-upload-input"
      />
      <button
        type="button"
        onClick={handleClick}
        className="file-upload-button"
      >
        {label}
      </button>
    </div>
  );
};

export default FileUpload;
