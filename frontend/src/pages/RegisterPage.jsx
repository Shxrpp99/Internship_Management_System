import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import * as authService from '../services/authService';
import { errMsg } from '../services/api';
import Msg from '../components/Msg.jsx';

export default function RegisterPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('STUDENT');
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    studentNumber: '',
    course: '',
    contactDetails: '',
    companyName: '',
    address: '',
    contactPerson: '',
    description: '',
  });

  const [msg, setMsg] = useState({});
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({});

    if (form.password.length < 12) {
      setMsg({ error: 'Password must be at least 12 characters long according to security policy.' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: form.email,
        password: form.password,
        role,
        ...(role === 'STUDENT'
          ? {
              fullName: form.fullName,
              studentNumber: form.studentNumber,
              course: form.course,
              contactDetails: form.contactDetails,
            }
          : {
              companyName: form.companyName,
              address: form.address,
              contactPerson: form.contactPerson,
              description: form.description,
            }),
      };

      const res = await authService.register(payload);
      login(res.data);
      navigate('/');
    } catch (err) {
      setMsg({ error: errMsg(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light py-5 px-3">
      <div className="card shadow-sm border-0" style={{ maxWidth: '560px', width: '100%' }}>
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <span className="fs-1">🎓</span>
            <h3 className="fw-bold mt-2 mb-1">Create Account</h3>
            <p className="text-muted small">Join IMS to manage internships and student progress</p>
          </div>

          <Msg msg={msg} onClose={() => setMsg({})} />

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Account Type</label>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className={`btn flex-fill ${role === 'STUDENT' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setRole('STUDENT')}
                >
                  <i className="bi bi-mortarboard me-1"></i> Student
                </button>
                <button
                  type="button"
                  className={`btn flex-fill ${role === 'COMPANY' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setRole('COMPANY')}
                >
                  <i className="bi bi-buildings me-1"></i> Company
                </button>
              </div>
              <div className="form-text small text-muted mt-1">
                Note: Supervisor accounts are assigned directly by the college administrator.
              </div>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-12">
                <label className="form-label small fw-semibold">Email address *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="user@example.com"
                  required
                  value={form.email}
                  onChange={handleChange('email')}
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Password (min 12 characters) *</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="At least 12 characters"
                  required
                  minLength={12}
                  value={form.password}
                  onChange={handleChange('password')}
                />
              </div>
            </div>

            {role === 'STUDENT' ? (
              <>
                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Alex Johnson"
                      required
                      value={form.fullName}
                      onChange={handleChange('fullName')}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Student ID / Number *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. S1002"
                      required
                      value={form.studentNumber}
                      onChange={handleChange('studentNumber')}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Course / Degree Program</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. BSc Computer Science"
                    value={form.course}
                    onChange={handleChange('course')}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Contact Details (Phone / Address)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. +977-9800000000"
                    value={form.contactDetails}
                    onChange={handleChange('contactDetails')}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Company / Organization Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Acme Tech Solutions"
                    required
                    value={form.companyName}
                    onChange={handleChange('companyName')}
                  />
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Contact Person</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Jane Doe"
                      value={form.contactPerson}
                      onChange={handleChange('contactPerson')}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Location / Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Kathmandu, Nepal"
                      value={form.address}
                      onChange={handleChange('address')}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Company Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Brief description of what your company does"
                    value={form.description}
                    onChange={handleChange('description')}
                  />
                </div>
                <div className="alert alert-info py-2 small">
                  <i className="bi bi-info-circle me-1"></i> New company registrations are submitted with <strong>PENDING</strong> status and must be verified by an administrator before posting internships.
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Creating Account...
                </>
              ) : (
                'Complete Registration'
              )}
            </button>
          </form>

          <div className="text-center mt-3">
            <span className="text-muted small">Already registered? </span>
            <Link to="/login" className="small fw-semibold text-decoration-none">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
