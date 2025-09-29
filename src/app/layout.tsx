
import React from 'react';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';

import PillNav from './components/PillNavClient';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Whiz Wizard - AI-Powered MCQ Generation",
  description: "Educational MCQ generation platform that uses AI to create quizzes accessible via WhatsApp bot for students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <PillNav
          logo="/logo.svg"
          logoAlt="Quiz Whiz Logo"
          items={[
            { label: 'Home', href: '/' },
            { label: 'Admin', href: '/admin/dashboard' },
            { label: 'Teacher', href: '/teacher/dashboard' },
            { label: 'Student', href: '/student-dashboard' },
            { label: 'Settings', href: '/settings' },
            { label: 'Contact', href: '/contact' }
          ]}
          baseColor="#f8f9ff"
          pillColor="#a78bfa"
          hoveredPillTextColor="#ffffff"
          pillTextColor="#4a5568"
        />
        <main>{children}</main>
      </body>
    </html>
  );
}
