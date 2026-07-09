'use client';

import React, { useState } from 'react';
import { useStore } from '../../lib/store';
import api from '../../lib/api';
import { Send, CheckCircle, Loader2 } from 'lucide-react';
import styles from './EmailSendPanel.module.css';

interface EmailSendPanelProps {
  jobId: string;
}

export default function EmailSendPanel({ jobId }: EmailSendPanelProps) {
  const { guestEmail } = useStore();
  const [recipient, setRecipient] = useState(guestEmail || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    try {
      const res = await api.post('/email', { jobId, recipient });
      if (res.data.success) {
        setSuccess(true);
      } else {
        setError('Failed to send email. Check SMTP credentials on server.');
      }
    } catch (err: any) {
      console.error('Email send failed:', err);
      setError(err.response?.data?.error || 'Server error sending email. Verify SMTP config.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Send to Email</h3>
      <p className={styles.subtitle}>
        Send the converted file directly to your inbox or share it with a friend as a high-quality email attachment.
      </p>
      
      <form onSubmit={handleSend} className={styles.form}>
        <input
          type="email"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className={styles.input}
          placeholder="recipient@example.com"
          disabled={loading || success}
          required
        />
        <button type="submit" className={styles.button} disabled={loading || success}>
          {loading ? (
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <>
              <Send size={16} />
              <span>{success ? 'Sent' : 'Send File'}</span>
            </>
          )}
        </button>
      </form>

      {success && (
        <div className={styles.successText}>
          <CheckCircle size={16} />
          <span>Email sent successfully! (Simulated if SMTP not configured)</span>
        </div>
      )}

      {error && <div className={styles.errorText}>{error}</div>}

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
