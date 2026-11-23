import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as assignmentService from '../services/assignmentService';
import { errMsg } from '../services/api';
import Loading from '../components/Loading.jsx';
import Msg from '../components/Msg.jsx';
import StatCard from '../components/StatCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function SupervisorDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({});

  useEffect(() => {
    assignmentService
      .list()
      .then((res) => {
        setAssignments(res.data || []);
      })
      .catch((err) => {
        setMsg({ error: errMsg(err) });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading message="Loading supervisor assignments..." />;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">Supervisor Dashboard</h2>
          <p className="text-muted mb-0">Oversee student internship placements, progress reports, and evaluations</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/reports" className="btn btn-primary d-flex align-items-center gap-2">
            <i className="bi bi-journal-text"></i>
            <span>Review Progress Reports</span>
          </Link>
          <Link to="/evaluations" className="btn btn-outline-primary d-flex align-items-center gap-2">
            <i className="bi bi-star"></i>
            <span>Submit Evaluations</span>
          </Link>
        </div>
      </div>

      <Msg msg={msg} onClose={() => setMsg({})} />

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-4">
          <StatCard title="Assigned Interns" value={assignments.length} icon="bi-people-fill" color="primary" />
        </div>
        <div className="col-sm-6 col-lg-4">
          <StatCard
            title="Active Supervision"
            value={assignments.filter((a) => a.status === 'ACTIVE').length}
            icon="bi-check-circle"
            color="success"
          />
        </div>
        <div className="col-sm-6 col-lg-4">
          <StatCard
            title="Completed Internships"
            value={assignments.filter((a) => a.status === 'COMPLETED').length}
            icon="bi-award"
            color="secondary"
          />
        </div>
      </div>

      {/* Assigned Students Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <span className="fw-semibold">My Assigned Students ({assignments.length})</span>
        </div>
        <div className="card-body p-0">
          {assignments.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <i className="bi bi-person-x fs-2 text-secondary mb-2 d-block"></i>
              <p className="mb-2">No students currently assigned to you for supervision.</p>
              <p className="small mb-0">
                The college administrator assigns supervisors to students after their internship application has been accepted.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Student ID</th>
                    <th>Internship & Company</th>
                    <th>Supervision Period</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((asg) => (
                    <tr key={asg.id}>
                      <td>
                        <div className="fw-bold text-dark">{asg.studentName}</div>
                      </td>
                      <td className="small text-muted">{asg.studentNumber}</td>
                      <td>
                        <div className="fw-medium">{asg.internshipTitle}</div>
                        <div className="small text-muted">{asg.companyName}</div>
                      </td>
                      <td className="small">
                        {asg.startDate} &rarr; {asg.endDate || 'Ongoing'}
                      </td>
                      <td>
                        <StatusBadge status={asg.status} />
                      </td>
                      <td className="text-end">
                        <Link to={`/reports`} className="btn btn-outline-primary btn-sm me-2">
                          <i className="bi bi-file-earmark-text me-1"></i> Reports
                        </Link>
                        <Link to={`/evaluations`} className="btn btn-outline-success btn-sm">
                          <i className="bi bi-pencil-square me-1"></i> Evaluate
                        </Link>
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
