import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as applicationService from '../services/applicationService';
import { errMsg } from '../services/api';
import Loading from '../components/Loading.jsx';
import Msg from '../components/Msg.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({});

  const loadData = () => {
    setLoading(true);
    applicationService
      .list()
      .then((res) => {
        setApplications(res.data || []);
      })
      .catch((err) => {
        setMsg({ error: errMsg(err) });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    setMsg({});
    try {
      await applicationService.cancel(id);
      setMsg({ success: 'Application withdrawn successfully.' });
      loadData();
    } catch (err) {
      setMsg({ error: errMsg(err) });
    }
  };

  const handleDownload = async (documentPath) => {
    try {
      await applicationService.download(documentPath);
    } catch (err) {
      setMsg({ error: errMsg(err) });
    }
  };

  if (loading) return <Loading message="Loading your applications..." />;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">My Internship Applications</h2>
          <p className="text-muted mb-0">Track application statuses, uploaded resumes, and company decisions</p>
        </div>
        <Link to="/internships" className="btn btn-primary d-flex align-items-center gap-2">
          <i className="bi bi-search"></i>
          <span>Browse More Internships</span>
        </Link>
      </div>

      <Msg msg={msg} onClose={() => setMsg({})} />

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <span className="fw-semibold">Submitted Applications ({applications?.length || 0})</span>
        </div>
        <div className="card-body p-0">
          {!applications || applications.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <i className="bi bi-file-earmark-x fs-1 text-secondary mb-2 d-block"></i>
              <h5>No applications submitted yet</h5>
              <p className="mb-3">Explore open positions and submit your CV to get started.</p>
              <Link to="/internships" className="btn btn-outline-primary btn-sm">
                Browse Internships
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Internship Role</th>
                    <th>Company</th>
                    <th>Date Applied</th>
                    <th>Resume</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <Link to={`/internships/${app.internshipId}`} className="fw-bold text-decoration-none">
                          {app.internshipTitle}
                        </Link>
                      </td>
                      <td>{app.companyName}</td>
                      <td className="small">{new Date(app.applicationDate).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
                          onClick={() => handleDownload(app.documentPath)}
                          title="Download submitted CV"
                        >
                          <i className="bi bi-file-earmark-arrow-down"></i>
                          <span>CV</span>
                        </button>
                      </td>
                      <td>
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="text-end">
                        {app.status === 'PENDING' ? (
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleCancel(app.id)}
                            title="Cancel pending application"
                          >
                            Withdraw
                          </button>
                        ) : (
                          <span className="text-muted small">Locked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
