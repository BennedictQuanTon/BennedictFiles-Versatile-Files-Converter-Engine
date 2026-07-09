'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../../lib/api';
import ConversionProgress from '../../../components/ConversionProgress/ConversionProgress';
import DownloadCard from '../../../components/DownloadCard/DownloadCard';
import EmailSendPanel from '../../../components/EmailSendPanel/EmailSendPanel';
import { AlertOctagon, ArrowLeft, RefreshCw } from 'lucide-react';
import styles from './result.module.css';

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [status, setStatus] = useState('PENDING');
  const [outputKey, setOutputKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.get(`/jobs/${jobId}`);
        if (response.data.success) {
          const job = response.data.job;
          setStatus(job.status);
          setOutputKey(job.outputKey);
          setErrorMsg(job.errorMsg);

          if (job.status === 'DONE' || job.status === 'FAILED') {
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
          }
        }
      } catch (err) {
        console.error('Error fetching job status:', err);
      }
    };

    fetchStatus();

    pollingRef.current = setInterval(fetchStatus, 2000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [jobId]);

  if (status === 'FAILED') {
    return (
      <div className={styles.container}>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>
            <AlertOctagon size={48} />
          </div>
          <h2 className={styles.errorTitle}>Conversion Failed</h2>
          <p className={styles.errorDesc}>
            {errorMsg || 'An unknown error occurred during conversion. Please check your file format and try again.'}
          </p>
          <button onClick={() => router.push('/')} className={styles.retryButton}>
            <RefreshCw size={18} />
            <span>Try Another File</span>
          </button>
        </div>
      </div>
    );
  }

  if (status === 'DONE' && outputKey) {
    return (
      <div className={styles.container}>
        <Link 
          href="/" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            color: 'var(--text-muted)',
            marginBottom: '1rem'
          }}
        >
          <ArrowLeft size={16} />
          <span>Convert another file</span>
        </Link>
        <DownloadCard outputKey={outputKey} />
        <EmailSendPanel jobId={jobId} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ConversionProgress status={status} />
    </div>
  );
}
