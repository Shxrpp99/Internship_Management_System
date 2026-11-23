import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as internshipService from '../services/internshipService';
import { errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import Loading from '../components/Loading.jsx';
import Msg from '../components/Msg.jsx';

export default function InternshipDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [internship, setInternship] = useState(null);
  const [msg, setMsg] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    internshipService
      .get(id)
      .then((res) => setInternship(res.data))
      .catch((err) => setMsg({ error: errMsg(err) }))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading message="Loading internship details..." />;

  if (msg.error) return <Msg msg={msg} />;
  if (!internship) return <div className="text-muted p-4">Internship not found.</div>;

  const today = new Date().toISOString().slice(0, 10);
  const expired = internship.deadline < today;
  const full = internship.acceptedCount >= internship.availableSeats;

  return (
    <div>
      <div className="mb-3">
        <Link to="/internships" className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1">
          <i className="bi bi-arrow-left"></i>
          <span>Back to Internships</span>
        </Link>
      </div>

      <div className="card shadow-sm border-0" style={{ maxWidth: '840px' }}>
        <div className="card-body p-4 p-md-5">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
            <div>
              <h2 className="fw-bold mb-1">{internship.title}</h2>
              <h5 className="text-muted d-flex align-items-center gap-2 mb-0">
                <i className="bi bi-buildings"></i>
                <span>{internship.companyName}</span>
                <span>&middot;</span>
                <i className="bi bi-geo-alt"></i>
                <span>{internship.location}</span>
              </h5>
            </div>
            <div>
              {expired ? (
                <span className="badge bg-danger fs-6">Application Closed</span>
              ) : full ? (
                <span className="badge bg-secondary fs-6">Seats Full</span>
              ) : (
                <span className="badge bg-success fs-6">Applications Open</span>
              )}
            </div>
          </div>

          <div className="row g-3 py-3 my-2 border-top border-bottom bg-light rounded-3 px-2">
            <div className="col-sm-4">
              <span className="small text-muted d-block">Available Seats</span>
              <strong className="fs-5">{internship.availableSeats}</strong>
              <span className="small text-muted ms-1">({internship.acceptedCount} filled)</span>
            </div>
            <div className="col-sm-4">
              <span className="small text-muted d-block">Deadline</span>
              <strong className="fs-5">{internship.deadline}</strong>
            </div>
            <div className="col-sm-4">
              <span className="small text-muted d-block">Location</span>
              <strong className="fs-5">{internship.location}</strong>
            </div>
          </div>

          <div className="mb-4">
            <h5 className="fw-bold text-dark mb-2">Description</h5>
            <p className="text-secondary" style={{ whiteSpace: 'pre-line' }}>
              {internship.description || 'No detailed description provided.'}
            </p>
          </div>

          <div className="mb-4">
            <h5 className="fw-bold text-dark mb-2">Requirements & Qualifications</h5>
            <p className="text-secondary" style={{ whiteSpace: 'pre-line' }}>
              {internship.requirements || 'No specific requirements listed.'}
            </p>
          </div>

          <div className="d-flex gap-2 pt-3 border-top">
            {user?.role === 'STUDENT' && !expired && !full && (
              <Link to={`/internships/${internship.id}/apply`} className="btn btn-primary px-4 py-2">
                <i className="bi bi-send me-1"></i> Apply for this Internship
              </Link>
            )}
            <Link to="/internships" className="btn btn-outline-secondary px-3 py-2">
              Back to List
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
