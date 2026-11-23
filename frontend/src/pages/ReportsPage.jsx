import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import * as assignmentService from '../services/assignmentService';
import * as reportService from '../services/reportService';
import { errMsg } from '../services/api';
import Loading from '../components/Loading.jsx';
import Msg from '../components/Msg.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function ReportsPage() {
  const { user } = useAuth();
  const isStudent = user.role === 'STUDENT';
  const isSupervisor = user.role === 'SUPERVISOR';

  const [assignments, setAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({});

  // Form for new report (student)
  const [form, setForm] = useState({
    reportingPeriod: '',
    workCompleted: '',
    challenges: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Feedback form per report (supervisor)
  const [feedbackState, setFeedbackState] = useState({});

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const res = await assignmentService.list();
      const list = res.data || [];
      setAssignments(list);

      if (list.length > 0) {
        setSelectedAssignmentId(String(list[0].id));
      }
    } catch (err) {
      setMsg({ error: errMsg(err) });
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async (assignmentId) => {
    try {
      const res = await reportService.list(assignmentId ? Number(assignmentId) : undefined);
      setReports(res.data || []);
    } catch (err) {
      setMsg({ error: errMsg(err) });
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    if (selectedAssignmentId) {
      loadReports(selectedAssignmentId);
    } else if (assignments.length === 0) {
      // If no assignments, load general user reports if any
      loadReports();
    }
  }, [selectedAssignmentId]);

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!selectedAssignmentId) {
      setMsg({ error: 'Please select a placement assignment.' });
      return;
    }

    setSubmitting(true);
    setMsg({});
    try {
      await reportService.submit({
        assignmentId: Number(selectedAssignmentId),
        reportingPeriod: form.reportingPeriod,
        workCompleted: form.workCompleted,
        challenges: form.challenges,
      });
      setForm({ reportingPeriod: '', workCompleted: '', challenges: '' });
      setMsg({ success: 'Progress report submitted successfully!' });
      loadReports(selectedAssignmentId);
    } catch (err) {
      setMsg({ error: errMsg(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendFeedback = async (reportId) => {
    const data = feedbackState[reportId] || {};
    if (!data.comments || !data.comments.trim()) {
      setMsg({ error: 'Please enter feedback comments.' });
      return;
    }

    setMsg({});
    try {
      await reportService.addFeedback(reportId, {
        comments: data.comments,
        status: data.status || 'REVIEWED',
      });
      setFeedbackState({ ...feedbackState, [reportId]: {} });
      setMsg({ success: 'Supervisor feedback submitted successfully!' });
      loadReports(selectedAssignmentId);
    } catch (err) {
      setMsg({ error: errMsg(err) });
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm('Delete this report? (Only reports awaiting review can be deleted)')) return;
    setMsg({});
    try {
      await reportService.remove(id);
      setMsg({ success: 'Report deleted.' });
      loadReports(selectedAssignmentId);
    } catch (err) {
      setMsg({ error: errMsg(err) });
    }
  };

  if (loading) return <Loading message="Loading progress reports..." />;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">
            {isStudent ? 'Weekly Progress Reports' : 'Review Student Progress Reports'}
          </h2>
          <p className="text-muted mb-0">
            {isStudent
              ? 'Submit weekly log of tasks, achievements, and challenges for supervisor review'
              : 'Review intern submissions and provide academic guidance & feedback'}
          </p>
        </div>
      </div>

      <Msg msg={msg} onClose={() => setMsg({})} />

      {assignments.length === 0 ? (
        <div className="card shadow-sm border-0 p-5 text-center text-muted">
          <i className="bi bi-journal-x fs-1 text-secondary mb-2"></i>
          <h5>No active placements found</h5>
          <p className="mb-0">
            {isStudent
              ? 'You need an active internship placement with an assigned supervisor to submit weekly reports.'
              : 'No students are currently assigned to you for supervision.'}
          </p>
        </div>
      ) : (
        <>
          {/* Assignment Selection */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body p-3 d-flex flex-wrap align-items-center gap-3">
              <label className="fw-semibold text-secondary small mb-0">
                <i className="bi bi-filter me-1"></i>
                Select Placement:
              </label>
              <div style={{ minWidth: '300px' }}>
                <select
                  className="form-select"
                  value={selectedAssignmentId}
                  onChange={(e) => setSelectedAssignmentId(e.target.value)}
                >
                  {assignments.map((asg) => (
                    <option key={asg.id} value={asg.id}>
                      {isStudent
                        ? `${asg.internshipTitle} - ${asg.companyName} (Supervisor: ${asg.supervisorName})`
                        : `${asg.studentName} (${asg.studentNumber}) - ${asg.internshipTitle}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Student Submit Report Form */}
            {isStudent && (
              <div className="col-lg-5">
                <div className="card shadow-sm border-0">
                  <div className="card-header bg-white d-flex align-items-center gap-2">
                    <i className="bi bi-pencil-square text-primary"></i>
                    <span className="fw-semibold">New Progress Report</span>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleSubmitReport}>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold">Reporting Period *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Week 1 (Oct 1 - Oct 7)"
                          required
                          value={form.reportingPeriod}
                          onChange={(e) => setForm({ ...form, reportingPeriod: e.target.value })}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold">Work Completed / Tasks Done *</label>
                        <textarea
                          className="form-control"
                          rows={4}
                          placeholder="Detail specific tasks, technical work, tools used, and deliverables accomplished..."
                          required
                          value={form.workCompleted}
                          onChange={(e) => setForm({ ...form, workCompleted: e.target.value })}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold">Challenges & Blockers Faced</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          placeholder="Describe any technical obstacles encountered and how you solved them or need help..."
                          value={form.challenges}
                          onChange={(e) => setForm({ ...form, challenges: e.target.value })}
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={submitting}
                      >
                        {submitting ? 'Submitting Report...' : 'Submit Report for Review'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Reports List */}
            <div className={isStudent ? 'col-lg-7' : 'col-12'}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Progress Reports History ({reports.length})</h5>
              </div>

              {reports.length === 0 ? (
                <div className="card shadow-sm border-0 p-5 text-center text-muted">
                  <i className="bi bi-inbox fs-2 text-secondary mb-2 d-block"></i>
                  <p className="mb-0">No reports submitted for this placement yet.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {reports.map((report) => (
                    <div className="card shadow-sm border-0" key={report.id}>
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h5 className="fw-bold text-dark mb-1">{report.reportingPeriod}</h5>
                            <div className="small text-muted">
                              <span>Submitted by {report.studentName}</span>
                              <span className="mx-1">&middot;</span>
                              <span>{new Date(report.submissionDate).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <StatusBadge status={report.status} />
                            {isStudent && report.status === 'SUBMITTED' && (
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDeleteReport(report.id)}
                                title="Delete report"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="my-3">
                          <h6 className="fw-semibold text-secondary small text-uppercase">Work Completed</h6>
                          <p className="text-dark mb-3" style={{ whiteSpace: 'pre-wrap' }}>
                            {report.workCompleted}
                          </p>

                          {report.challenges && (
                            <>
                              <h6 className="fw-semibold text-secondary small text-uppercase">Challenges & Resolutions</h6>
                              <p className="text-dark mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                                {report.challenges}
                              </p>
                            </>
                          )}
                        </div>

                        {/* Supervisor Feedback Timeline */}
                        {report.feedback && report.feedback.length > 0 && (
                          <div className="mt-3 pt-3 border-top">
                            <h6 className="fw-bold small text-primary mb-2">
                              <i className="bi bi-chat-quote-fill me-1"></i> Supervisor Feedback
                            </h6>
                            <div className="d-flex flex-column gap-2">
                              {report.feedback.map((fb) => (
                                <div
                                  key={fb.id}
                                  className="p-3 rounded-3 bg-light border-start border-4 border-primary"
                                >
                                  <div className="d-flex justify-content-between small text-muted mb-1">
                                    <strong className="text-dark">{fb.supervisorName}</strong>
                                    <span>{new Date(fb.feedbackDate).toLocaleString()}</span>
                                  </div>
                                  <div className="text-dark small" style={{ whiteSpace: 'pre-wrap' }}>
                                    {fb.comments}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Supervisor Review Input Form */}
                        {isSupervisor && (
                          <div className="mt-3 pt-3 border-top bg-light-subtle p-3 rounded-3">
                            <h6 className="fw-semibold small text-dark mb-2">Provide Feedback on this Report</h6>
                            <div className="row g-2">
                              <div className="col-md-7">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="Enter constructive remarks or guidance..."
                                  value={feedbackState[report.id]?.comments || ''}
                                  onChange={(e) =>
                                    setFeedbackState({
                                      ...feedbackState,
                                      [report.id]: {
                                        ...feedbackState[report.id],
                                        comments: e.target.value,
                                      },
                                    })
                                  }
                                />
                              </div>
                              <div className="col-md-3">
                                <select
                                  className="form-select form-select-sm"
                                  value={feedbackState[report.id]?.status || 'REVIEWED'}
                                  onChange={(e) =>
                                    setFeedbackState({
                                      ...feedbackState,
                                      [report.id]: {
                                        ...feedbackState[report.id],
                                        status: e.target.value,
                                      },
                                    })
                                  }
                                >
                                  <option value="REVIEWED">Mark Reviewed</option>
                                  <option value="CHANGES_REQUESTED">Request Changes</option>
                                </select>
                              </div>
                              <div className="col-md-2">
                                <button
                                  className="btn btn-success btn-sm w-100"
                                  onClick={() => handleSendFeedback(report.id)}
                                >
                                  Send
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
