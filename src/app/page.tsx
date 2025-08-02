
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100 text-center" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div>
        <h1 className="mb-4" style={{ color: 'var(--primary-600)', fontSize: '3rem', fontWeight: '700' }}>Quiz Whiz</h1>
        <p className="mb-5" style={{ maxWidth: '700px', margin: '0 auto', fontSize: '1.125rem', color: 'var(--gray-600)' }}>
          Empowering education through interactive and accessible learning. Quiz Whiz brings dynamic quizzes directly to students via WhatsApp, making learning engaging, instant, and effective.
        </p>

        <div className="d-flex justify-content-center mb-5" style={{ maxWidth: '900px', margin: '0 auto', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div className="card" style={{ flex: '1', minWidth: '280px', maxWidth: '300px' }}>
            <div className="card-body">
              <h5 className="card-title" style={{ color: 'var(--success-600)' }}>Why WhatsApp?</h5>
              <p className="card-text">
                Meet students where they are. WhatsApp's ubiquity ensures easy access to educational content without needing new apps or complex setups. It's familiar, fast, and fosters consistent engagement.
              </p>
            </div>
          </div>
          <div className="card" style={{ flex: '1', minWidth: '280px', maxWidth: '300px' }}>
            <div className="card-body">
              <h5 className="card-title" style={{ color: 'var(--primary-600)' }}>Benefits for Children</h5>
              <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
                <li className="mb-2"><i className="bi bi-check-circle-fill" style={{ color: 'var(--primary-600)', marginRight: '0.5rem' }}></i>Instant Feedback & Learning</li>
                <li className="mb-2"><i className="bi bi-check-circle-fill" style={{ color: 'var(--primary-600)', marginRight: '0.5rem' }}></i>Engaging & Gamified Quizzes</li>
                <li className="mb-2"><i className="bi bi-check-circle-fill" style={{ color: 'var(--primary-600)', marginRight: '0.5rem' }}></i>Accessible Anytime, Anywhere</li>
                <li className="mb-2"><i className="bi bi-check-circle-fill" style={{ color: 'var(--primary-600)', marginRight: '0.5rem' }}></i>Boosts Confidence & Retention</li>
              </ul>
            </div>
          </div>
          <div className="card" style={{ flex: '1', minWidth: '280px', maxWidth: '300px' }}>
            <div className="card-body">
              <h5 className="card-title" style={{ color: 'var(--warning-600)' }}>For Institutions</h5>
              <p className="card-text">
                Streamline assessment, track student progress effortlessly, and extend learning beyond the classroom. Quiz Whiz provides valuable insights for teachers and administrators.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: '0 auto' }}>
          <Link href="/signup" className="btn btn-primary btn-lg">Get Started - Sign Up</Link>
          <Link href="/login" className="btn btn-outline-primary btn-lg">Already a User? Log In</Link>
        </div>
      </div>
    </div>
  );
}
