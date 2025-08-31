
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

// Modern icon component with better styling
const Icon = ({ name, className = "" }: { name: string; className?: string }) => (
  <span className={`material-icons ${className}`} style={{ 
    verticalAlign: 'middle', 
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    {name}
  </span>
);

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Don't render the navbar on login or signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`navbar-modern ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo/Brand Section */}
        <div className="navbar-brand-section">
          <Link href="/" className="navbar-brand" onClick={closeMobileMenu}>
            <div className="brand-icon">
              <Icon name="quiz" />
            </div>
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
          className={`navbar-mobile-toggle ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <div className="hamburger">
            <span className="line"></span>
            <span className="line"></span>
            <span className="line"></span>
          </div>
        </button>

        {/* Mobile Navigation Overlay */}
        <div className={`navbar-mobile-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={closeMobileMenu}></div>
        
        {/* Mobile Navigation */}
        <div className={`navbar-mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-header">
            <span className="mobile-nav-title">Menu</span>
            <button className="mobile-close-btn" onClick={closeMobileMenu}>
              <Icon name="close" />
            </button>
          </div>
          <ul className="navbar-mobile-nav-list">
            <li className="nav-item">
              <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`} onClick={closeMobileMenu}>
                <Icon name="home" />
                <span>Home</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/admin/dashboard" className={`nav-link ${pathname?.startsWith('/admin') ? 'active' : ''}`} onClick={closeMobileMenu}>
                <Icon name="admin_panel_settings" />
                <span>Admin</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/teacher/dashboard" className={`nav-link ${pathname?.startsWith('/teacher') ? 'active' : ''}`} onClick={closeMobileMenu}>
                <Icon name="school" />
                <span>Teacher</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/student-dashboard" className={`nav-link ${pathname?.startsWith('/student-dashboard') ? 'active' : ''}`} onClick={closeMobileMenu}>
                <Icon name="dashboard" />
                <span>Student</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/settings" className={`nav-link ${pathname?.startsWith('/settings') ? 'active' : ''}`} onClick={closeMobileMenu}>
                <Icon name="settings" />
                <span>Settings</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/contact" className={`nav-link ${pathname?.startsWith('/contact') ? 'active' : ''}`} onClick={closeMobileMenu}>
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
