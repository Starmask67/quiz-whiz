
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light text-center py-5">
      <h1 className="display-4 fw-bold text-primary mb-4">Quiz Whiz</h1>
      <p className="lead mb-5" style={{ maxWidth: '700px' }}>
        Empowering education through interactive and accessible learning. Quiz Whiz brings dynamic quizzes directly to students via WhatsApp, making learning engaging, instant, and effective.
      </p>

      <div className="row justify-content-center mb-5" style={{ maxWidth: '900px' }}>
        <div className="col-md-6 col-lg-4 mb-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body p-4">
              <h5 className="card-title text-success mb-3">Why WhatsApp?</h5>
              <p className="card-text text-muted">
                Meet students where they are. WhatsApp's ubiquity ensures easy access to educational content without needing new apps or complex setups. It's familiar, fast, and fosters consistent engagement.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4 mb-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body p-4">
              <h5 className="card-title text-info mb-3">Benefits for Children</h5>
              <ul className="list-unstyled text-muted text-start">
                <li className="mb-2"><i className="bi bi-check-circle-fill text-info me-2"></i>Instant Feedback & Learning</li>
                <li className="mb-2"><i className="bi bi-check-circle-fill text-info me-2"></i>Engaging & Gamified Quizzes</li>
                <li className="mb-2"><i className="bi bi-check-circle-fill text-info me-2"></i>Accessible Anytime, Anywhere</li>
                <li className="mb-2"><i className="bi bi-check-circle-fill text-info me-2"></i>Boosts Confidence & Retention</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4 mb-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body p-4">
              <h5 className="card-title text-warning mb-3">For Institutions</h5>
              <p className="card-text text-muted">
                Streamline assessment, track student progress effortlessly, and extend learning beyond the classroom. Quiz Whiz provides valuable insights for teachers and administrators.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="d-grid gap-3 col-md-6 col-lg-4 mx-auto">
        <Link href="/signup" className="btn btn-primary btn-lg shadow-sm">Get Started - Sign Up</Link>
        <Link href="/login" className="btn btn-outline-primary btn-lg shadow-sm">Already a User? Log In</Link>
      </div>
    </div>
  );
}
