import React from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div>
        © {new Date().getFullYear()} <span className={styles.brand}>BennedictFiles</span>. All rights reserved.
      </div>
      <div>
        Sleek, high-resolution conversions. Powered by open-source engines.
      </div>
    </footer>
  );
}
