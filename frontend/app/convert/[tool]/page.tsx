'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '../../../lib/store';
import { TOOLS } from '../../../lib/tools';
import api from '../../../lib/api';
import FileDropzone from '../../../components/FileDropzone/FileDropzone';
import { ArrowLeft, Loader2, ArrowRight } from 'lucide-react';
import styles from './convert.module.css';

export default function ConvertPage() {
  const router = useRouter();
  const params = useParams();
  const { guestId } = useStore();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toolId = params.tool as string;
  const tool = TOOLS.find((t) => t.id === toolId);

  if (!tool) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Tool Not Found</h1>
          <p className={styles.desc}>The conversion utility you requested does not exist.</p>
          <Link href="/" className={styles.backLink} style={{ marginTop: '2rem' }}>
            <ArrowLeft size={16} />
            <span>Go Back Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleFileSelect = (files: File[]) => {
    if (tool.multiple) {
      setSelectedFiles((prev) => [...prev, ...files]);
    } else {
      setSelectedFiles(files.slice(0, 1));
    }
    setError('');
  };

  const handleFileRemove = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setError('Please select a file to convert');
      return;
    }
    if (!guestId) {
      setError('Guest identification is missing. Please refresh and enter your email.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFiles[0]); // MVP processes single file uploads
      formData.append('guestId', guestId);
      formData.append('tool', tool.id);

      const response = await api.post('/jobs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        router.push(`/result/${response.data.jobId}`);
      } else {
        setError('Failed to create conversion job. Please try again.');
      }
    } catch (err: any) {
      console.error('Job submission failed:', err);
      setError(
        err.response?.data?.error || 
        'Could not connect to the backend server. Make sure the API is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backLink}>
        <ArrowLeft size={16} />
        <span>Back to tools</span>
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>{tool.name}</h1>
        <p className={styles.desc}>{tool.description}</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.card}>
        <FileDropzone
          onFileSelect={handleFileSelect}
          selectedFiles={selectedFiles}
          onFileRemove={handleFileRemove}
          accepts={tool.accepts}
          multiple={tool.multiple}
        />

        {error && <div className={styles.error}>{error}</div>}

        <button
          type="submit"
          className={styles.button}
          disabled={loading || selectedFiles.length === 0}
        >
          {loading ? (
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <>
              <span>Convert Now</span>
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </form>
      
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
