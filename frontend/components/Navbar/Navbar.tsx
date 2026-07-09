'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '../../lib/store';
import { Sparkles, LogOut } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { guestEmail, clearGuest } = useStore();

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logoContainer}>
        <div className={styles.logo}>
          <Sparkles className={styles.logoIcon} />
          <span>BennedictFiles</span>
        </div>
      </Link>
      
      {guestEmail && (
        <div className={styles.userSection}>
          <span className={styles.userEmail}>{guestEmail}</span>
          <button onClick={clearGuest} className={styles.logoutButton} title="Change Email">
            <LogOut size={16} />
            <span>Reset</span>
          </button>
        </div>
      )}
    </nav>
  );
}
