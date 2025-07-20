
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
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link href="/" className="navbar-brand">
          <Icon name="quiz" />
          QuizWhiz
        </Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link href="/admin/dashboard" className={`nav-link ${pathname?.startsWith('/admin') ? 'active' : ''}`}>
                <Icon name="admin_panel_settings" />
                Admin
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/teacher/dashboard" className={`nav-link ${pathname?.startsWith('/teacher') ? 'active' : ''}`}>
                <Icon name="school" />
                Teacher
              </Link>
            </li>
            
            <li className="nav-item">
              <Link href="/student-dashboard" className={`nav-link ${pathname?.startsWith('/student-dashboard') ? 'active' : ''}`}>
                <Icon name="dashboard" />
                Student Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/settings" className={`nav-link ${pathname?.startsWith('/settings') ? 'active' : ''}`}>
                <Icon name="settings" />
                Settings
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/contact" className={`nav-link ${pathname?.startsWith('/contact') ? 'active' : ''}`}>
                <Icon name="contact_mail" />
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
