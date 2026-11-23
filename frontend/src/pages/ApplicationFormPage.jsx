import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import * as internshipService from '../services/internshipService';
import * as applicationService from '../services/applicationService';
import { errMsg } from '../services/api';
import Loading from '../components/Loading.jsx';
import Msg from '../components/Msg.jsx';

export default function ApplicationFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [internship, setInternship] = useState(null);
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    internshipService
      .get(id)
      .then((res) => setInternship(res.data))
      .catch((err) => setMsg({ error: errMsg(err) }))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMsg({ error: 'Please select a CV or resume file (PDF or DOCX format).' });
      return;
    }

    // Client-side file size check: max 10MB
    if (file.size > 10 * 1024 * 1024) {
      setMsg({ error: 'File size exceeds 10MB limit. Please upload a smaller file.' });
      return;
    }

    setSubmitting(true);
    setMsg({});
    try {
      await applicationService.apply(id, file);
      navigate('/my-applications');
    } catch (err) {
      setMsg({ error: errMsg(err) });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading application form..." />;

  return (
    <div style={{ maxWidth: '680px' }}>
      <div className="mb-3">
        <Link to={`/internships/${id}`} className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1">
          <i className="bi bi-arrow-left"></i>
          <span>Back to Details</span>
        </Link>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-4 p-md-5">
          <div className="mb-4">
            <h3 className="fw-bold mb-1">Submit Application</h3>
            <p className="text-muted mb-0">
              Applying for: <strong className="text-dark">{internship?.title}</strong> at {internship?.companyName}
            </p>
          </div>

          <Msg msg={msg} onClose={() => setMsg({})} />

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label fw-semibold">Upload Curriculum Vitae / Resume (PDF or DOCX) *</label>
              <div className="border border-2 border-dashed rounded-3 p-4 text-center bg-light">
                <i className="bi bi-cloud-arrow-up fs-1 text-primary mb-2 d-block"></i>
                <input
                  type="file"
                  id="cv-upload"
                  className="form-control"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  required
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <div className="form-text mt-2 small text-muted">
                  Max file size: 10MB. Accepted formats: PDF (.pdf), Word (.docx).
                </div>
              </div>
              {file && (
                <div className="alert alert-info py-2 px-3 mt-3 d-flex align-items-center small">
                  <i className="bi bi-file-earmark-check fs-5 me-2"></i>
                  <span>Selected file: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary px-4 py-2 fw-semibold"
                disabled={submitting || !file}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Submitting Application...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
              <Link to={`/internships/${id}`} className="btn btn-outline-secondary px-3 py-2">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
