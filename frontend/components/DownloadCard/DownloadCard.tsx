'use client';

import React from 'react';
import { Check, Download } from 'lucide-react';
import styles from './DownloadCard.module.css';

interface DownloadCardProps {
  outputKey: string;
}

export default function DownloadCard({ outputKey }: DownloadCardProps) {
  const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/files/${outputKey}`;

  return (
    <div className={styles.card}>
      <div className={styles.iconWrapper}>
        <Check size={36} />
      </div>
      <h2 className={styles.title}>Conversion Complete!</h2>
      <p className={styles.subtitle}>
        Your file has been converted successfully. Download it directly below.
      </p>
      
      <a href={downloadUrl} download className={styles.downloadButton}>
        <Download size={20} />
        <span>Download Converted File</span>
      </a>
    </div>
  );
}
