import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import * as assignmentService from '../services/assignmentService';
import * as evaluationService from '../services/evaluationService';
import { errMsg } from '../services/api';
import Loading from '../components/Loading.jsx';
import Msg from '../components/Msg.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

function AssignmentEvaluationCard({ assignment, canSubmit, currentUserRole }) {
  const [evaluations, setEvaluations] = useState([]);
  const [form, setForm] = useState({ score: '', comments: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({});

  const loadEvaluations = () => {
    setLoading(true);
    evaluationService
      .list(assignment.id)
      .then((res) => {
        setEvaluations(res.data || []);
      })
      .catch((err) => {
        setMsg({ error: errMsg(err) });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEvaluations();
  }, [assignment.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const scoreNum = Number(form.score);
    if (scoreNum < 1 || scoreNum > 100) {
      setMsg({ error: 'Score must be between 1 and 100.' });
      return;
    }

    setSubmitting(true);
    setMsg({});
    try {
      await evaluationService.submit({
        assignmentId: assignment.id,
        score: scoreNum,
        comments: form.comments,
      });
      setForm({ score: '', comments: '' });
      setMsg({ success: 'Evaluation successfully recorded!' });
      loadEvaluations();
    } catch (err) {
      setMsg({ error: errMsg(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const hasAlreadyEvaluated = evaluations.some(
    (ev) => ev.evaluatorRole === currentUserRole
  );

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h5 className="fw-bold mb-1">{assignment.studentName}</h5>
          <div className="small text-muted">
            <span>Student ID: {assignment.studentNumber}</span>
            <span className="mx-1">&middot;</span>
            <span>{assignment.internshipTitle} ({assignment.companyName})</span>
            <span className="mx-1">&middot;</span>
            <span>Supervisor: {assignment.supervisorName}</span>
          </div>
        </div>
        <StatusBadge status={assignment.status} />
      </div>

      <div className="card-body p-4">
        <Msg msg={msg} onClose={() => setMsg({})} />

        <h6 className="fw-bold small text-secondary text-uppercase mb-3">Recorded Evaluations</h6>

        {loading ? (
          <div className="text-muted small py-2">Loading evaluations...</div>
        ) : evaluations.length === 0 ? (
          <p className="text-muted small mb-3">No evaluations submitted for this student yet.</p>
        ) : (
          <div className="row g-3 mb-3">
            {evaluations.map((ev) => (
              <div className="col-md-6" key={ev.id}>
                <div className="border rounded-3 p-3 bg-light h-100">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className={`badge ${ev.evaluatorRole === 'COMPANY' ? 'bg-warning text-dark' : 'bg-info text-dark'}`}>
                      {ev.evaluatorRole} EVALUATION
                    </span>
                    <span className="fs-5 fw-bold text-primary">
                      {ev.score} <span className="fs-6 text-muted fw-normal">/ 100</span>
                    </span>
                  </div>
                  <div className="small text-muted mb-2">
                    By {ev.evaluatorName} on {new Date(ev.evaluationDate).toLocaleDateString()}
                  </div>
                  <p className="small text-dark mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                    {ev.comments}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Evaluation Input Form for Company / Supervisor */}
        {canSubmit && !hasAlreadyEvaluated && (
          <div className="mt-4 pt-3 border-top">
            <h6 className="fw-bold text-dark mb-3">
              <i className="bi bi-star-fill text-warning me-1"></i>
              Submit Final Evaluation
            </h6>
            <form onSubmit={handleSubmit} className="row g-2 align-items-start">
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Performance Score (1 - 100) *</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="form-control"
                  placeholder="e.g. 92"
                  required
                  value={form.score}
                  onChange={(e) => setForm({ ...form, score: e.target.value })}
                />
              </div>
              <div className="col-md-7">
                <label className="form-label small fw-semibold">Evaluation Comments & Assessment *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Assessment of student performance, skills, punctuality, and output..."
                  required
                  value={form.comments}
                  onChange={(e) => setForm({ ...form, comments: e.target.value })}
                />
              </div>
              <div className="col-md-2" style={{ paddingTop: '28px' }}>
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Score'}
                </button>
              </div>
            </form>
          </div>
        )}

        {canSubmit && hasAlreadyEvaluated && (
          <div className="small text-success mt-2">
            <i className="bi bi-check2-circle me-1"></i> You have already submitted your final evaluation for this student.
          </div>
        )}
      </div>
    </div>
  );
}

export default function EvaluationPage() {
  const { user } = useAuth();
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

  if (loading) return <Loading message="Loading evaluations..." />;

  const canSubmit = user.role === 'COMPANY' || user.role === 'SUPERVISOR';

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">Final Internship Evaluations</h2>
          <p className="text-muted mb-0">
            Official assessments, scoring (1-100), and remarks by hosting companies and college supervisors
          </p>
        </div>
      </div>

      <Msg msg={msg} onClose={() => setMsg({})} />

      {assignments.length === 0 ? (
        <div className="card shadow-sm border-0 p-5 text-center text-muted">
          <i className="bi bi-award fs-1 text-secondary mb-2 d-block"></i>
          <h5>No placements available for evaluation</h5>
          <p className="mb-0">
            Evaluations are recorded for students with active internship supervision assignments.
          </p>
        </div>
      ) : (
        assignments.map((assignment) => (
          <AssignmentEvaluationCard
            key={assignment.id}
            assignment={assignment}
            canSubmit={canSubmit}
            currentUserRole={user.role}
          />
        ))
      )}
    </div>
  );
}
