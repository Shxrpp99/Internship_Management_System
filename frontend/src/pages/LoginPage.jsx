import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import * as authService from '../services/authService';
import { errMsg } from '../services/api';
import Msg from '../components/Msg.jsx';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState({});
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setMsg({});
    setLoading(true);
    try {
      const res = await authService.login(form.email, form.password);
      login(res.data);
      navigate('/');
    } catch (err) {
      setMsg({ error: errMsg(err) });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (email, password) => {
    setForm({ email, password });
    setMsg({});
    setLoading(true);
    authService.login(email, password)
      .then((res) => {
        login(res.data);
        navigate('/');
      })
      .catch((err) => {
        setMsg({ error: errMsg(err) });
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light py-5 px-3">
      <div className="card shadow-sm border-0" style={{ maxWidth: '440px', width: '100%' }}>
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <span className="fs-1">🎓</span>
            <h3 className="fw-bold mt-2 mb-1">Welcome Back</h3>
            <p className="text-muted small">Internship Management and Monitoring System</p>
          </div>

          <Msg msg={msg} onClose={() => setMsg({})} />

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Email address</label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted"><i className="bi bi-envelope"></i></span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@college.edu"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted"><i className="bi bi-lock"></i></span>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="text-center mt-3">
            <span className="text-muted small">Don't have an account? </span>
            <Link to="/register" className="small fw-semibold text-decoration-none">
              Register here
            </Link>
          </div>

          <div className="border-top pt-3 mt-4">
            <div className="text-muted small fw-semibold mb-2">⚡ Quick Demo Accounts (One-Click):</div>
            <div className="d-grid gap-2">
              <div
                className="quick-login-btn d-flex justify-content-between align-items-center"
                onClick={() => handleQuickLogin('admin@college.edu', 'password123')}
              >
                <div>
                  <strong>Admin:</strong> admin@college.edu
                </div>
                <span className="badge bg-danger">ADMIN</span>
              </div>
              <div
                className="quick-login-btn d-flex justify-content-between align-items-center"
                onClick={() => handleQuickLogin('company@techcorp.com', 'password123')}
              >
                <div>
                  <strong>Company:</strong> company@techcorp.com
                </div>
                <span className="badge bg-warning text-dark">COMPANY</span>
              </div>
              <div
                className="quick-login-btn d-flex justify-content-between align-items-center"
                onClick={() => handleQuickLogin('supervisor@college.edu', 'password123')}
              >
                <div>
                  <strong>Supervisor:</strong> supervisor@college.edu
                </div>
                <span className="badge bg-info text-dark">SUPERVISOR</span>
              </div>
              <div
                className="quick-login-btn d-flex justify-content-between align-items-center"
                onClick={() => handleQuickLogin('student@college.edu', 'password123')}
              >
                <div>
                  <strong>Student:</strong> student@college.edu
                </div>
                <span className="badge bg-primary">STUDENT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
