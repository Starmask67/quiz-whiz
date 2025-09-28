
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

  // Handle scroll effect for navbar with throttling for better performance
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
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
            <span className="brand-text">Whiz Wizard</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-desktop-nav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
                <span>Home</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/student-dashboard" className={`nav-link ${pathname?.startsWith('/student-dashboard') ? 'active' : ''}`}>
                <span>Dashboard</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/settings" className={`nav-link ${pathname?.startsWith('/settings') ? 'active' : ''}`}>
                <span>Settings</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/contact" className={`nav-link ${pathname?.startsWith('/contact') ? 'active' : ''}`}>
                <span>Contact Us</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/signup" className="nav-link bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 rounded-full px-6 py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                <span>Get Started</span>
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
                <span>Home</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/student-dashboard" className={`nav-link ${pathname?.startsWith('/student-dashboard') ? 'active' : ''}`} onClick={closeMobileMenu}>
                <span>Dashboard</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/settings" className={`nav-link ${pathname?.startsWith('/settings') ? 'active' : ''}`} onClick={closeMobileMenu}>
                <span>Settings</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/contact" className={`nav-link ${pathname?.startsWith('/contact') ? 'active' : ''}`} onClick={closeMobileMenu}>
                <span>Contact Us</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/signup" className="nav-link bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 rounded-full px-6 py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-300" onClick={closeMobileMenu}>
                <span>Get Started</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
