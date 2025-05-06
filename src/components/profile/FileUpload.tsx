'use client';

import { X } from 'lucide-react';
import React from 'react';

interface FileUploadProps {
  id: string;
  label: string;
  acceptedFormats: string;
  multiple?: boolean;
  helpText: string;
  icon: React.ReactNode;
  onFileSelect: (files: FileList | null) => void;
  selectedFile?: File | null;
  selectedFiles?: File[];
  onRemove: (index?: number) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  id,
  label,
  acceptedFormats,
  multiple = false,
  helpText,
  icon,
  onFileSelect,
  selectedFile,
  selectedFiles,
  onRemove,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e.target.files);
  };

  const handleClick = () => {
    document.getElementById(id)?.click();
  };

  return (
    <div className='mt-4'>
      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
        {label}
      </label>

      {/* File Input Area */}
      <div
        onClick={handleClick}
        className='mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors bg-gray-50 dark:bg-gray-800/50'
      >
        <div className='space-y-2 text-center'>
          <div className='flex justify-center'>{icon}</div>
          <div className='text-sm text-gray-600 dark:text-gray-400'>
            <span className='font-medium text-blue-500 hover:text-blue-600'>
              {helpText}
            </span>
            <input
              id={id}
              type='file'
              className='hidden'
              accept={acceptedFormats}
              multiple={multiple}
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>

      {/* Selected Files Display */}
      {!multiple && selectedFile && (
        <div className='mt-2 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100 dark:border-blue-800'>
          <div className='flex items-center space-x-2'>
            {icon}
            <span className='text-sm text-gray-700 dark:text-gray-300'>
              {selectedFile.name}
            </span>
          </div>
          <button
            type='button'
            onClick={() => onRemove()}
            className='text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20'
          >
            <X size={18} />
          </button>
        </div>
      )}

      {multiple && selectedFiles && selectedFiles.length > 0 && (
        <div className='mt-2 space-y-2'>
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className='flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100 dark:border-blue-800'
            >
              <div className='flex items-center space-x-2'>
                {icon}
                <span className='text-sm text-gray-700 dark:text-gray-300'>
                  Certificação {index + 1}: {file.name}
                </span>
              </div>
              <button
                type='button'
                onClick={() => onRemove(index)}
                className='text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20'
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
