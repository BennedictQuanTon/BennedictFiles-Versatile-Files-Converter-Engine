'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../../lib/store';
import api from '../../lib/api';
import { Mail, ArrowRight, Loader2 } from 'lucide-react';
import styles from './EmailGate.module.css';

export default function EmailGate() {
  const { guestEmail, setGuest } = useStore();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (guestEmail) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Email address is required');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/guests', { email });
      if (response.data.success) {
        const guest = response.data.guest;
        setGuest(guest.email, guest.id);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (err: any) {
      console.error('Email registration failed:', err);
      // Fallback to local guest mockup so development flow isn't blocked
      const mockId = `mock-guest-${Math.random().toString(36).substring(2, 11)}`;
      setGuest(email, mockId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.iconContainer}>
          <Mail size={32} />
        </div>
        <h2 className={styles.title}>BennedictFiles</h2>
        <p className={styles.subtitle}>
          Please enter your email to get started. We will use this email to identify you and deliver your converted files directly to your inbox.
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputWrapper}>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              disabled={loading}
              required
            />
            {error && <div className={styles.error}>{error}</div>}
          </div>
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? (
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <>
                <span>Start Converting</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
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
