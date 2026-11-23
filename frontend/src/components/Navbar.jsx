import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColors = {
    ADMIN: 'danger',
    COMPANY: 'warning text-dark',
    SUPERVISOR: 'info text-dark',
    STUDENT: 'primary',
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3 shadow-sm" style={{ minHeight: '64px' }}>
      <div className="container-fluid">
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 mb-0">
          <span className="fs-4">🎓</span>
          <span className="fw-bold tracking-tight">IMS</span>
          <span className="d-none d-sm-inline opacity-75 fw-normal small">| Internship Management System</span>
        </Link>

        {user && (
          <div className="d-flex align-items-center gap-3 ms-auto text-white">
            <div className="text-end d-none d-md-block">
              <div className="fw-semibold small leading-tight">{user.fullName || user.email}</div>
              <div className="text-white-50" style={{ fontSize: '0.75rem' }}>{user.email}</div>
            </div>
            <span className={`badge bg-${roleColors[user.role] || 'secondary'} px-2 py-1`}>
              {user.role}
            </span>
            <button
              className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
              onClick={handleLogout}
              title="Sign out"
            >
              <i className="bi bi-box-arrow-right"></i>
              <span className="d-none d-sm-inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
