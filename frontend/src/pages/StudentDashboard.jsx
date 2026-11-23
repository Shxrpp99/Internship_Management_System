import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as studentService from '../services/studentService';
import * as applicationService from '../services/applicationService';
import * as assignmentService from '../services/assignmentService';
import { errMsg } from '../services/api';
import Loading from '../components/Loading.jsx';
import Msg from '../components/Msg.jsx';
import StatCard from '../components/StatCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({});
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stuRes, appRes, asgRes] = await Promise.all([
        studentService.list(),
        applicationService.list(),
        assignmentService.list(),
      ]);

      const stu = Array.isArray(stuRes.data) ? stuRes.data[0] : stuRes.data;
      setProfile(stu);
      setApplications(appRes.data || []);
      setAssignments(asgRes.data || []);
    } catch (err) {
      setMsg({ error: errMsg(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMsg({});
    try {
      const res = await studentService.update(profile.id, {
        name: profile.name,
        course: profile.course,
        contactDetails: profile.contactDetails,
      });
      setProfile(res.data);
      setMsg({ success: 'Profile successfully updated!' });
    } catch (err) {
      setMsg({ error: errMsg(err) });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading message="Loading student dashboard..." />;

  const pendingCount = applications.filter((a) => a.status === 'PENDING').length;
  const acceptedCount = applications.filter((a) => a.status === 'ACCEPTED').length;
  const rejectedCount = applications.filter((a) => a.status === 'REJECTED').length;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">Student Dashboard</h2>
          <p className="text-muted mb-0">Welcome back, {profile?.name || 'Student'}!</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/internships" className="btn btn-primary d-flex align-items-center gap-2">
            <i className="bi bi-search"></i>
            <span>Browse Internships</span>
          </Link>
          <Link to="/reports" className="btn btn-outline-primary d-flex align-items-center gap-2">
            <i className="bi bi-file-earmark-plus"></i>
            <span>Submit Report</span>
          </Link>
        </div>
      </div>

      <Msg msg={msg} onClose={() => setMsg({})} />

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <StatCard title="Active Placements" value={assignments.length} icon="bi-mortarboard-fill" color="primary" />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard title="Pending Applications" value={pendingCount} icon="bi-hourglass-split" color="warning" />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard title="Accepted Offers" value={acceptedCount} icon="bi-check-circle-fill" color="success" />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard title="Rejected / Closed" value={rejectedCount} icon="bi-x-circle-fill" color="danger" />
        </div>
      </div>

      <div className="row g-4">
        {/* Profile Card */}
        <div className="col-lg-5">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-header bg-white d-flex align-items-center gap-2">
              <i className="bi bi-person-circle text-primary fs-5"></i>
              <span>My Academic Profile</span>
            </div>
            <div className="card-body">
              {profile ? (
                <form onSubmit={handleProfileSave}>
                  <div className="mb-3">
                    <label className="form-label small text-muted fw-semibold">Student ID / Number</label>
                    <input type="text" className="form-control bg-light" disabled value={profile.studentNumber || ''} />
                    <div className="form-text small">Student ID cannot be changed.</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-muted fw-semibold">Registered Email</label>
                    <input type="text" className="form-control bg-light" disabled value={profile.email || ''} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-muted fw-semibold">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={profile.name || ''}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-muted fw-semibold">Course / Degree Program</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profile.course || ''}
                      onChange={(e) => setProfile({ ...profile, course: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small text-muted fw-semibold">Contact Details</label>
                    <input
                      type="text"
                      className="form-control"
                      value={profile.contactDetails || ''}
                      onChange={(e) => setProfile({ ...profile, contactDetails: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Update Profile'}
                  </button>
                </form>
              ) : (
                <div className="text-muted small">No profile information available.</div>
              )}
            </div>
          </div>
        </div>

        {/* Placements & Recent Activity */}
        <div className="col-lg-7">
          <div className="card mb-4 shadow-sm border-0">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <span className="d-flex align-items-center gap-2">
                <i className="bi bi-briefcase-fill text-success fs-5"></i>
                <span>Assigned Placement & Supervisor</span>
              </span>
              <span className="badge bg-primary-subtle text-primary">{assignments.length} Active</span>
            </div>
            <div className="card-body p-0">
              {assignments.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <i className="bi bi-file-earmark-check fs-2 text-secondary mb-2 d-block"></i>
                  <p className="mb-2">You currently have no active internship assignments.</p>
                  <p className="small mb-3">
                    Once a company accepts your application, an administrator will assign your college supervisor.
                  </p>
                  <Link to="/internships" className="btn btn-outline-primary btn-sm">
                    Browse Internships
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Internship & Company</th>
                        <th>College Supervisor</th>
                        <th>Period</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((asg) => (
                        <tr key={asg.id}>
                          <td>
                            <div className="fw-semibold text-dark">{asg.internshipTitle}</div>
                            <div className="small text-muted">{asg.companyName}</div>
                          </td>
                          <td>
                            <div className="fw-medium">{asg.supervisorName}</div>
                            <div className="small text-muted">{asg.supervisorEmail}</div>
                          </td>
                          <td className="small">
                            {asg.startDate} &rarr; {asg.endDate || 'Ongoing'}
                          </td>
                          <td>
                            <StatusBadge status={asg.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Quick links to actions */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white">
              <i className="bi bi-lightning-charge text-warning me-2"></i>
              <span>Quick Actions</span>
            </div>
            <div className="card-body">
              <div className="row g-2">
                <div className="col-md-4">
                  <Link to="/my-applications" className="btn btn-outline-secondary w-100 text-start py-2">
                    <i className="bi bi-file-text me-2"></i> Track Applications
                  </Link>
                </div>
                <div className="col-md-4">
                  <Link to="/reports" className="btn btn-outline-secondary w-100 text-start py-2">
                    <i className="bi bi-pencil-square me-2"></i> Weekly Reports
                  </Link>
                </div>
                <div className="col-md-4">
                  <Link to="/evaluations" className="btn btn-outline-secondary w-100 text-start py-2">
                    <i className="bi bi-award me-2"></i> Final Evaluations
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
