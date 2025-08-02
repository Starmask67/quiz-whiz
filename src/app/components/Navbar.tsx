
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// A simple icon component for demonstration
const Icon = ({ name }: { name: string }) => (
    <span className="material-icons" style={{ verticalAlign: 'middle', marginRight: '8px' }}>{name}</span>
);

export default function Navbar() {
  const pathname = usePathname();

  // Don't render the navbar on login or signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="container">
        <Link href="/" className="navbar-brand">
          <Icon name="quiz" />
          QuizWhiz
        </Link>
        <ul className="navbar-nav">
          <li>
            <Link href="/admin/dashboard" className={`nav-link ${pathname?.startsWith('/admin') ? 'active' : ''}`}>
              <Icon name="admin_panel_settings" />
              Admin
            </Link>
          </li>
          <li>
            <Link href="/teacher/dashboard" className={`nav-link ${pathname?.startsWith('/teacher') ? 'active' : ''}`}>
              <Icon name="school" />
              Teacher
            </Link>
          </li>
          
          <li>
            <Link href="/student-dashboard" className={`nav-link ${pathname?.startsWith('/student-dashboard') ? 'active' : ''}`}>
              <Icon name="dashboard" />
              Student Dashboard
            </Link>
          </li>
          <li>
            <Link href="/settings" className={`nav-link ${pathname?.startsWith('/settings') ? 'active' : ''}`}>
              <Icon name="settings" />
              Settings
            </Link>
          </li>
          <li>
            <Link href="/contact" className={`nav-link ${pathname?.startsWith('/contact') ? 'active' : ''}`}>
              <Icon name="contact_mail" />
              Contact Us
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
