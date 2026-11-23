import { useEffect, useState } from 'react';
import * as companyService from '../services/companyService';
import * as internshipService from '../services/internshipService';
import * as applicationService from '../services/applicationService';
import { errMsg } from '../services/api';
import Loading from '../components/Loading.jsx';
import Msg from '../components/Msg.jsx';
import StatCard from '../components/StatCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const EMPTY_INTERNSHIP = {
  title: '',
  description: '',
  requirements: '',
  location: '',
  availableSeats: 1,
  deadline: '',
};

export default function CompanyDashboard() {
  const [company, setCompany] = useState(null);
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState(null);

  const [form, setForm] = useState(EMPTY_INTERNSHIP);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [posting, setPosting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [compRes, allInternshipsRes, appRes] = await Promise.all([
        companyService.list(),
        internshipService.list(),
        applicationService.list(),
      ]);

      const comp = Array.isArray(compRes.data) ? compRes.data[0] : compRes.data;
      setCompany(comp);

      // Filter all internships down to those belonging to this company
      const myInternships = comp
        ? (allInternshipsRes.data || []).filter((i) => i.companyId === comp.id)
        : [];
      setInternships(myInternships);
      setApplications(appRes.data || []);

      if (myInternships.length > 0 && !selectedInternshipId) {
        setSelectedInternshipId(myInternships[0].id);
      }
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
    if (!company) return;
    setSavingProfile(true);
    setMsg({});
    try {
      const res = await companyService.update(company.id, {
        companyName: company.companyName,
        address: company.address,
        contactPerson: company.contactPerson,
        description: company.description,
      });
      setCompany(res.data);
      setMsg({ success: 'Company profile successfully updated!' });
    } catch (err) {
      setMsg({ error: errMsg(err) });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePostInternship = async (e) => {
    e.preventDefault();
    setPosting(true);
    setMsg({});
    try {
      await internshipService.create({
        ...form,
        availableSeats: Number(form.availableSeats),
      });
      setForm(EMPTY_INTERNSHIP);
      setMsg({ success: 'Internship posting published successfully!' });
      loadData();
    } catch (err) {
      setMsg({ error: errMsg(err) });
    } finally {
      setPosting(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    setMsg({});
    try {
      await applicationService.updateStatus(appId, newStatus);
      setMsg({ success: `Application marked as ${newStatus}` });
      loadData();
    } catch (err) {
      setMsg({ error: errMsg(err) });
    }
  };

  const handleDownloadCv = async (documentPath) => {
    try {
      await applicationService.download(documentPath);
    } catch (err) {
      setMsg({ error: errMsg(err) });
    }
  };

  if (loading) return <Loading message="Loading company dashboard..." />;

  const isApproved = company?.approvalStatus === 'APPROVED';
  const totalSeats = internships.reduce((sum, i) => sum + (i.availableSeats || 0), 0);
  const totalAccepted = applications.filter((a) => a.status === 'ACCEPTED').length;
  const filteredApplicants = selectedInternshipId
    ? applications.filter((a) => a.internshipId === selectedInternshipId)
    : applications;

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">Company Dashboard</h2>
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted">{company?.companyName}</span>
            <StatusBadge status={company?.approvalStatus} />
          </div>
        </div>
      </div>

      <Msg msg={msg} onClose={() => setMsg({})} />

      {!isApproved && (
        <div className="alert alert-warning d-flex align-items-center mb-4 shadow-sm" role="alert">
          <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
          <div>
            <strong>Account Pending Verification:</strong> Your company profile is currently pending admin review.
            Once approved by the college administrator, you will be able to publish internship openings.
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <StatCard title="Active Postings" value={internships.length} icon="bi-briefcase-fill" color="primary" />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard title="Total Applicants" value={applications.length} icon="bi-people-fill" color="info" />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard title="Interns Accepted" value={totalAccepted} icon="bi-check-all" color="success" />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard title="Capacity Open" value={Math.max(0, totalSeats - totalAccepted)} icon="bi-pie-chart-fill" color="warning" />
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Profile & Post New Internship */}
        <div className="col-lg-5">
          {/* Post Internship Form */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white d-flex align-items-center gap-2">
              <i className="bi bi-plus-circle-fill text-primary"></i>
              <span>Post New Internship</span>
            </div>
            <div className="card-body">
              <form onSubmit={handlePostInternship}>
                <fieldset disabled={!isApproved}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Job / Internship Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Backend Developer Intern"
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Location / Mode *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Kathmandu or Remote"
                        required
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Available Seats *</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        className="form-control"
                        required
                        value={form.availableSeats}
                        onChange={(e) => setForm({ ...form, availableSeats: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Application Deadline *</label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      value={form.deadline}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Role Description</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Details on project, tech stack, team..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Requirements / Skills</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="e.g. Java, Spring Boot, React, Git..."
                      value={form.requirements}
                      onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-100" disabled={posting || !isApproved}>
                    {posting ? 'Publishing...' : 'Publish Internship'}
                  </button>
                </fieldset>
              </form>
            </div>
          </div>

          {/* Company Profile Edit */}
          {company && (
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white d-flex align-items-center gap-2">
                <i className="bi bi-building-gear text-secondary"></i>
                <span>Company Profile</span>
              </div>
              <div className="card-body">
                <form onSubmit={handleProfileSave}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Company Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={company.companyName || ''}
                      onChange={(e) => setCompany({ ...company, companyName: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Contact Person</label>
                    <input
                      type="text"
                      className="form-control"
                      value={company.contactPerson || ''}
                      onChange={(e) => setCompany({ ...company, contactPerson: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Address / Headquarters</label>
                    <input
                      type="text"
                      className="form-control"
                      value={company.address || ''}
                      onChange={(e) => setCompany({ ...company, address: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Description</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={company.description || ''}
                      onChange={(e) => setCompany({ ...company, description: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-outline-primary" disabled={savingProfile}>
                    {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Manage Postings & Review Applicants */}
        <div className="col-lg-7">
          {/* Posted Internships */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <span className="fw-semibold">My Active Postings ({internships.length})</span>
            </div>
            <div className="card-body p-0">
              {internships.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  No internships posted yet. Use the form on the left to create your first posting.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Location</th>
                        <th>Capacity</th>
                        <th>Deadline</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {internships.map((i) => {
                        const isFull = i.acceptedCount >= i.availableSeats;
                        const isSelected = selectedInternshipId === i.id;
                        return (
                          <tr key={i.id} className={isSelected ? 'table-primary-subtle' : ''}>
                            <td>
                              <div className="fw-bold">{i.title}</div>
                            </td>
                            <td>{i.location}</td>
                            <td>
                              <span className={`badge ${isFull ? 'bg-secondary' : 'bg-success'}`}>
                                {i.acceptedCount} / {i.availableSeats} filled
                              </span>
                            </td>
                            <td className="small">{i.deadline}</td>
                            <td className="text-end">
                              <button
                                className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setSelectedInternshipId(i.id)}
                              >
                                <i className="bi bi-people me-1"></i> Applicants
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Applicants Review Section */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <span className="fw-semibold">
                Candidates & Applicants ({filteredApplicants.length})
              </span>
              {selectedInternshipId && (
                <button
                  className="btn btn-link btn-sm text-decoration-none p-0"
                  onClick={() => setSelectedInternshipId(null)}
                >
                  Show all applicants
                </button>
              )}
            </div>
            <div className="card-body p-0">
              {filteredApplicants.length === 0 ? (
                <div className="p-4 text-center text-muted">
                  <i className="bi bi-inbox fs-2 text-secondary mb-2 d-block"></i>
                  No candidates have applied for this internship position yet.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Position</th>
                        <th>Applied On</th>
                        <th>CV / Resume</th>
                        <th>Decision</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplicants.map((app) => (
                        <tr key={app.id}>
                          <td>
                            <div className="fw-semibold">{app.studentName}</div>
                            <div className="small text-muted">ID: {app.studentNumber}</div>
                          </td>
                          <td className="small">{app.internshipTitle}</td>
                          <td className="small">{new Date(app.applicationDate).toLocaleDateString()}</td>
                          <td>
                            <button
                              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                              onClick={() => handleDownloadCv(app.documentPath)}
                              title="Download CV"
                            >
                              <i className="bi bi-file-earmark-arrow-down"></i>
                              <span>Download</span>
                            </button>
                          </td>
                          <td>
                            {app.status === 'PENDING' ? (
                              <div className="d-flex gap-1">
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleStatusChange(app.id, 'ACCEPTED')}
                                  title="Accept Candidate"
                                >
                                  Accept
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleStatusChange(app.id, 'REJECTED')}
                                  title="Reject Candidate"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <StatusBadge status={app.status} />
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
      </div>
    </div>
  );
}
