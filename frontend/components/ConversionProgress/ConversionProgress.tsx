'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import styles from './ConversionProgress.module.css';

interface ConversionProgressProps {
  status: string;
}

export default function ConversionProgress({ status }: ConversionProgressProps) {
  const getProgressPercentage = () => {
    switch (status) {
      case 'PENDING': return 25;
      case 'PROCESSING': return 65;
      case 'DONE': return 100;
      default: return 0;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'PENDING': return 'Enqueued in Queue...';
      case 'PROCESSING': return 'Converting in High-Res...';
      case 'DONE': return 'Finished!';
      case 'FAILED': return 'Conversion Failed';
      default: return 'Starting...';
    }
  };

  const percentage = getProgressPercentage();

  return (
    <div className={styles.card}>
      <div className={styles.spinnerContainer}>
        <Loader2 size={48} style={{ animation: 'spin 1.5s linear infinite' }} />
      </div>
      <h2 className={styles.title}>{getStatusLabel()}</h2>
      <p className={styles.subtitle}>
        {status === 'PROCESSING' 
          ? 'Rendering file. High-resolution output takes just a few seconds...'
          : 'Waiting for worker queue availability...'}
      </p>
      
      <div className={styles.progressTrack}>
        <div 
          className={styles.progressBar} 
          style={{ 
            width: `${percentage}%`,
            background: status === 'FAILED' ? 'var(--error)' : 'var(--gradient-brand)'
          }}
        />
      </div>
      <div className={styles.statusText} style={{ color: status === 'FAILED' ? 'var(--error)' : 'var(--primary)' }}>
        {status}
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
