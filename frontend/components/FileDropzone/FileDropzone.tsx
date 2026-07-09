'use client';

import React from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X } from 'lucide-react';
import styles from './FileDropzone.module.css';

interface FileDropzoneProps {
  onFileSelect: (files: File[]) => void;
  selectedFiles: File[];
  onFileRemove: (index: number) => void;
  accepts: string;
  multiple: boolean;
}

export default function FileDropzone({
  onFileSelect,
  selectedFiles,
  onFileRemove,
  accepts,
  multiple,
}: FileDropzoneProps) {
  
  const getAcceptObject = () => {
    const obj: Record<string, string[]> = {};
    const extensions = accepts.split(',');
    
    extensions.forEach(ext => {
      const cleanExt = ext.trim().toLowerCase();
      if (cleanExt === '.pdf') {
        obj['application/pdf'] = ['.pdf'];
      } else if (cleanExt === '.docx') {
        obj['application/vnd.openxmlformats-officedocument.wordprocessingml.document'] = ['.docx'];
      } else if (cleanExt === '.xlsx') {
        obj['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] = ['.xlsx'];
      } else if (cleanExt === '.png') {
        obj['image/png'] = ['.png'];
      } else if (cleanExt === '.jpg' || cleanExt === '.jpeg') {
        obj['image/jpeg'] = ['.jpg', '.jpeg'];
      }
    });
    
    return obj;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      onFileSelect(acceptedFiles);
    },
    accept: getAcceptObject(),
    multiple,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={`${styles.dropzone} ${isDragActive ? styles.active : ''}`}
      >
        <input {...getInputProps()} />
        <div className={styles.iconWrapper}>
          <UploadCloud size={40} />
        </div>
        <div>
          <h3 className={styles.title}>
            {isDragActive ? 'Drop your files here' : 'Drag & drop files here'}
          </h3>
          <p className={styles.subtitle}>
            or click to browse from your computer (Max 50MB)
          </p>
        </div>
        <p className={styles.subtitle} style={{ fontSize: '0.75rem', marginTop: '-0.5rem' }}>
          Accepted formats: {accepts.toUpperCase()}
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className={styles.fileList}>
          {selectedFiles.map((file, index) => (
            <div key={index} className={styles.fileItem}>
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>{formatSize(file.size)}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileRemove(index);
                }}
                className={styles.removeBtn}
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
