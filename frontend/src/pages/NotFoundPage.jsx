import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="text-center py-5">
      <div className="display-1 fw-bold text-primary mb-3">404</div>
      <h3 className="fw-bold mb-2">Page Not Found</h3>
      <p className="text-muted mb-4">The page you are looking for does not exist or has been moved.</p>
      <Link to="/" className="btn btn-primary">
        Return to Home
      </Link>
    </div>
  );
}
