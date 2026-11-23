import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as reportService from '../services/reportService';
import { errMsg } from '../services/api';
import Loading from '../components/Loading.jsx';
import Msg from '../components/Msg.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function FeedbackPage() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({});

  useEffect(() => {
    reportService
      .list()
      .then((res) => {
        setReports(res.data || []);
      })
      .catch((err) => {
        setMsg({ error: errMsg(err) });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading message="Loading supervisor feedback..." />;

  const reportsWithFeedback = (reports || []).filter(
    (r) => r.feedback && r.feedback.length > 0
  );

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">Supervisor Feedback</h2>
          <p className="text-muted mb-0">Review academic feedback and guidance from your assigned supervisor</p>
        </div>
        <Link to="/reports" className="btn btn-outline-primary d-flex align-items-center gap-2">
          <i className="bi bi-file-earmark-text"></i>
          <span>View All Reports</span>
        </Link>
      </div>

      <Msg msg={msg} onClose={() => setMsg({})} />

      {reportsWithFeedback.length === 0 ? (
        <div className="card shadow-sm border-0 p-5 text-center text-muted">
          <i className="bi bi-chat-left-dots fs-1 text-secondary mb-2 d-block"></i>
          <h5>No feedback received yet</h5>
          <p className="mb-0">
            Submit your weekly progress reports. Once your supervisor reviews them, their comments will appear here.
          </p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {reportsWithFeedback.map((report) => (
            <div className="card shadow-sm border-0" key={report.id}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="fw-bold mb-0">{report.reportingPeriod}</h5>
                    <span className="small text-muted">{report.internshipTitle}</span>
                  </div>
                  <StatusBadge status={report.status} />
                </div>

                <div className="bg-light p-3 rounded-3 mb-3 small">
                  <strong>Work logged: </strong>
                  <span className="text-secondary">{report.workCompleted}</span>
                </div>

                <h6 className="fw-bold text-primary small mb-2">
                  <i className="bi bi-chat-quote-fill me-1"></i> Feedback Remarks:
                </h6>

                <div className="d-flex flex-column gap-2">
                  {report.feedback.map((f) => (
                    <div
                      key={f.id}
                      className="p-3 rounded-3 bg-white border border-primary-subtle border-start border-4 border-primary"
                    >
                      <div className="d-flex justify-content-between small text-muted mb-1">
                        <strong className="text-dark">{f.supervisorName}</strong>
                        <span>{new Date(f.feedbackDate).toLocaleString()}</span>
                      </div>
                      <div className="text-dark" style={{ whiteSpace: 'pre-wrap' }}>
                        {f.comments}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
