
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

// A simple icon component for demonstration
const Icon = ({ name }: { name: string }) => (
    <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '8px' }}>{name}</span>
);

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Don't render the navbar on login or signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar-modern">
      <div className="navbar-container">
        {/* Logo/Brand Section */}
        <div className="navbar-brand-section">
          <Link href="/" className="navbar-brand">
            <Icon name="quiz" />
            <span className="brand-text">QuizWhiz</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-desktop-nav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
                <Icon name="home" />
                <span>Home</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/admin/dashboard" className={`nav-link ${pathname?.startsWith('/admin') ? 'active' : ''}`}>
                <Icon name="admin_panel_settings" />
                <span>Admin</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/teacher/dashboard" className={`nav-link ${pathname?.startsWith('/teacher') ? 'active' : ''}`}>
                <Icon name="school" />
                <span>Teacher</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/student-dashboard" className={`nav-link ${pathname?.startsWith('/student-dashboard') ? 'active' : ''}`}>
                <Icon name="dashboard" />
                <span>Student</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/settings" className={`nav-link ${pathname?.startsWith('/settings') ? 'active' : ''}`}>
                <Icon name="settings" />
                <span>Settings</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/contact" className={`nav-link ${pathname?.startsWith('/contact') ? 'active' : ''}`}>
                <Icon name="contact_mail" />
                <span>Contact</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="navbar-mobile-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
            <span className="line"></span>
            <span className="line"></span>
            <span className="line"></span>
          </span>
        </button>

        {/* Mobile Navigation */}
        <div className={`navbar-mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <ul className="navbar-mobile-nav-list">
            <li className="nav-item">
              <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                <Icon name="home" />
                <span>Home</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/admin/dashboard" className={`nav-link ${pathname?.startsWith('/admin') ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                <Icon name="admin_panel_settings" />
                <span>Admin</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/teacher/dashboard" className={`nav-link ${pathname?.startsWith('/teacher') ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                <Icon name="school" />
                <span>Teacher</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/student-dashboard" className={`nav-link ${pathname?.startsWith('/student-dashboard') ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                <Icon name="dashboard" />
                <span>Student</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/settings" className={`nav-link ${pathname?.startsWith('/settings') ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                <Icon name="settings" />
                <span>Settings</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/contact" className={`nav-link ${pathname?.startsWith('/contact') ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                <Icon name="contact_mail" />
                <span>Contact</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
