import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import EmailGate from '../components/EmailGate/EmailGate';
import '../styles/globals.css';

export const metadata = {
  title: 'BennedictFiles — High Resolution Online File Converter',
  description: 'Convert and compress PDF, Word, Excel, and images instantly in high-resolution quality.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <EmailGate />
      </body>
    </html>
  );
}
