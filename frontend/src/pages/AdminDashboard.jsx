import { useEffect, useState } from 'react';
import * as adminService from '../services/adminService';
import * as companyService from '../services/companyService';
import * as internshipService from '../services/internshipService';
import * as applicationService from '../services/applicationService';
import * as assignmentService from '../services/assignmentService';
import { errMsg } from '../services/api';
import Loading from '../components/Loading.jsx';
import Msg from '../components/Msg.jsx';
import StatCard from '../components/StatCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const TABS = [
  { id: 'overview', label: 'Overview & Metrics', icon: 'bi-grid-fill' },
  { id: 'companies', label: 'Company Approvals', icon: 'bi-buildings' },
  { id: 'assignments', label: 'Supervisor Assignments', icon: 'bi-person-check-fill' },
  { id: 'users', label: 'User Management', icon: 'bi-people-fill' },
  { id: 'internships', label: 'Internships', icon: 'bi-briefcase-fill' },
  { id: 'applications', label: 'Applications', icon: 'bi-file-earmark-text-fill' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({
    stats: {},
    companies: [],
    users: [],
    internships: [],
    applications: [],
    assignments: [],
  });

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({});

  // Form for assigning supervisor
  const [assignForm, setAssignForm] = useState({});

  // Form for creating new admin / supervisor user
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: 'SUPERVISOR',
    fullName: '',
  });
  const [creatingUser, setCreatingUser] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, compRes, userRes, internRes, appRes, asgRes] = await Promise.all([
        adminService.stats(),
        companyService.list(),
        adminService.users(),
        internshipService.list(),
        applicationService.list(),
        assignmentService.list(),
      ]);

      setData({
        stats: statsRes.data || {},
        companies: compRes.data || [],
        users: userRes.data || [],
        internships: internRes.data || [],
        applications: appRes.data || [],
        assignments: asgRes.data || [],
      });
    } catch (err) {
      setMsg({ error: errMsg(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveCompany = async (id, status) => {
    setMsg({});
    try {
      await companyService.approve(id, status);
      setMsg({ success: `Company status updated to ${status}!` });
      loadData();
    } catch (err) {
      setMsg({ error: errMsg(err) });
    }
  };

  const handleToggleUserActive = async (u) => {
    setMsg({});
    try {
      await adminService.updateUser(u.id, {
        active: !u.active,
        fullName: u.fullName,
      });
      setMsg({ success: `User account ${u.active ? 'deactivated' : 'activated'} successfully!` });
      loadData();
    } catch (err) {
      setMsg({ error: errMsg(err) });
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setMsg({});
    try {
      await adminService.removeUser(id);
      setMsg({ success: 'User account removed.' });
      loadData();
    } catch (err) {
      setMsg({ error: errMsg(err) });
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (newUser.password.length < 12) {
      setMsg({ error: 'Password must be at least 12 characters.' });
      return;
    }
    setCreatingUser(true);
    setMsg({});
    try {
      await adminService.createUser(newUser);
      setNewUser({ email: '', password: '', role: 'SUPERVISOR', fullName: '' });
      setMsg({ success: 'User account created successfully!' });
      loadData();
    } catch (err) {
      setMsg({ error: errMsg(err) });
    } finally {
      setCreatingUser(false);
    }
  };

  const handleCreateAssignment = async (application) => {
    const supervisorId = assignForm[application.id];
    if (!supervisorId) {
      setMsg({ error: 'Please select a supervisor to assign.' });
      return;
    }

    setMsg({});
    try {
      await assignmentService.create({
        studentId: application.studentId,
        internshipId: application.internshipId,
        supervisorId: Number(supervisorId),
        startDate: new Date().toISOString().slice(0, 10),
      });
      setMsg({ success: 'Supervisor assigned to student successfully!' });
      setAssignForm({ ...assignForm, [application.id]: '' });
      loadData();
    } catch (err) {
      setMsg({ error: errMsg(err) });
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    setMsg({});
    try {
      await assignmentService.remove(id);
      setMsg({ success: 'Assignment removed.' });
      loadData();
    } catch (err) {
      setMsg({ error: errMsg(err) });
    }
  };

  if (loading && !data.users.length) {
    return <Loading message="Loading administration console..." />;
  }

  const supervisors = data.users.filter((u) => u.role === 'SUPERVISOR' && u.active);
  const assignedKeys = new Set(data.assignments.map((a) => `${a.studentId}-${a.internshipId}`));
  const unassignedApplications = data.applications.filter(
    (a) => a.status === 'ACCEPTED' && !assignedKeys.has(`${a.studentId}-${a.internshipId}`)
  );

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">Admin Console</h2>
          <p className="text-muted mb-0">System administration, company approvals, and academic oversight</p>
        </div>
      </div>

      <Msg msg={msg} onClose={() => setMsg({})} />

      {/* Navigation Tabs */}
      <ul className="nav nav-pills mb-4 gap-2 bg-white p-2 rounded-3 shadow-sm border">
        {TABS.map((tab) => (
          <li className="nav-item" key={tab.id}>
            <button
              className={`nav-link d-flex align-items-center gap-2 py-2 px-3 ${
                activeTab === tab.id ? 'active' : 'text-secondary'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={`bi ${tab.icon}`}></i>
              <span>{tab.label}</span>
              {tab.id === 'companies' && data.stats?.pendingCompanies > 0 && (
                <span className="badge bg-warning text-dark ms-1">
                  {data.stats.pendingCompanies}
                </span>
              )}
              {tab.id === 'assignments' && unassignedApplications.length > 0 && (
                <span className="badge bg-danger ms-1">{unassignedApplications.length}</span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="row g-3">
          <div className="col-sm-6 col-lg-3">
            <StatCard title="Total Users" value={data.stats.totalUsers} icon="bi-people" color="primary" />
          </div>
          <div className="col-sm-6 col-lg-3">
            <StatCard title="Students" value={data.stats.students} icon="bi-mortarboard" color="info" />
          </div>
          <div className="col-sm-6 col-lg-3">
            <StatCard title="Companies" value={data.stats.companies} icon="bi-buildings" color="secondary" />
          </div>
          <div className="col-sm-6 col-lg-3">
            <StatCard
              title="Pending Companies"
              value={data.stats.pendingCompanies}
              icon="bi-hourglass-split"
              color={data.stats.pendingCompanies > 0 ? 'warning' : 'success'}
            />
          </div>
          <div className="col-sm-6 col-lg-3">
            <StatCard title="Internships" value={data.stats.internships} icon="bi-briefcase" color="primary" />
          </div>
          <div className="col-sm-6 col-lg-3">
            <StatCard title="Applications" value={data.stats.applications} icon="bi-file-earmark-text" color="info" />
          </div>
          <div className="col-sm-6 col-lg-3">
            <StatCard
              title="Accepted Placements"
              value={data.stats.acceptedApplications}
              icon="bi-check-circle"
              color="success"
            />
          </div>
          <div className="col-sm-6 col-lg-3">
            <StatCard title="Active Assignments" value={data.stats.assignments} icon="bi-person-badge" color="primary" />
          </div>
          <div className="col-sm-6 col-lg-3">
            <StatCard title="Weekly Reports" value={data.stats.reports} icon="bi-journal-check" color="success" />
          </div>
          <div className="col-sm-6 col-lg-3">
            <StatCard title="Evaluations" value={data.stats.evaluations} icon="bi-award" color="warning" />
          </div>
        </div>
      )}

      {/* Tab: Companies Approval */}
      {activeTab === 'companies' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <span className="fw-semibold">Registered Companies ({data.companies.length})</span>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Company Name</th>
                    <th>Contact Person</th>
                    <th>Account Email</th>
                    <th>Address</th>
                    <th>Status</th>
                    <th className="text-end">Verification Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.companies.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="fw-bold">{c.companyName}</div>
                        <div className="small text-muted">{c.description}</div>
                      </td>
                      <td>{c.contactPerson || '-'}</td>
                      <td>{c.email}</td>
                      <td>{c.address || '-'}</td>
                      <td>
                        <StatusBadge status={c.approvalStatus} />
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-1">
                          <button
                            className="btn btn-sm btn-success"
                            disabled={c.approvalStatus === 'APPROVED'}
                            onClick={() => handleApproveCompany(c.id, 'APPROVED')}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            disabled={c.approvalStatus === 'REJECTED'}
                            onClick={() => handleApproveCompany(c.id, 'REJECTED')}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data.companies.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-muted p-4">
                        No registered companies found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Assignments */}
      {activeTab === 'assignments' && (
        <div className="row g-4">
          {/* Unassigned accepted students */}
          <div className="col-12">
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <span className="fw-semibold text-danger">
                  <i className="bi bi-exclamation-circle-fill me-2"></i>
                  Accepted Students Awaiting Supervisor Assignment ({unassignedApplications.length})
                </span>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Accepted Student</th>
                        <th>Internship & Company</th>
                        <th>Assign College Supervisor</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unassignedApplications.map((app) => (
                        <tr key={app.id}>
                          <td>
                            <div className="fw-bold">{app.studentName}</div>
                            <div className="small text-muted">ID: {app.studentNumber}</div>
                          </td>
                          <td>
                            <div className="fw-medium">{app.internshipTitle}</div>
                            <div className="small text-muted">{app.companyName}</div>
                          </td>
                          <td style={{ maxWidth: '300px' }}>
                            <select
                              className="form-select form-select-sm"
                              value={assignForm[app.id] || ''}
                              onChange={(e) => setAssignForm({ ...assignForm, [app.id]: e.target.value })}
                            >
                              <option value="">-- Choose Supervisor --</option>
                              {supervisors.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.fullName || s.email}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-primary btn-sm"
                              disabled={!assignForm[app.id]}
                              onClick={() => handleCreateAssignment(app)}
                            >
                              Confirm Assignment
                            </button>
                          </td>
                        </tr>
                      ))}
                      {unassignedApplications.length === 0 && (
                        <tr>
                          <td colSpan="4" className="text-center text-muted p-4">
                            All accepted students have been assigned to a supervisor.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Current Assignments Table */}
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <span className="fw-semibold">All Active Supervision Placements ({data.assignments.length})</span>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Internship & Company</th>
                        <th>Assigned Supervisor</th>
                        <th>Duration</th>
                        <th>Status</th>
                        <th className="text-end">Manage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.assignments.map((asg) => (
                        <tr key={asg.id}>
                          <td>
                            <div className="fw-bold">{asg.studentName}</div>
                            <div className="small text-muted">{asg.studentNumber}</div>
                          </td>
                          <td>
                            <div className="fw-medium">{asg.internshipTitle}</div>
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
                          <td className="text-end">
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDeleteAssignment(asg.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {data.assignments.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center text-muted p-4">
                            No assignments exist yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Users Management */}
      {activeTab === 'users' && (
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white">
                <i className="bi bi-person-plus-fill text-primary me-2"></i>
                <span className="fw-semibold">Create Staff Account</span>
              </div>
              <div className="card-body">
                <form onSubmit={handleCreateUser}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Role *</label>
                    <select
                      className="form-select"
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    >
                      <option value="SUPERVISOR">Supervisor</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                    <div className="form-text small">
                      Student and Company accounts are registered through the public portal.
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Dr. Sarah Supervisor"
                      required
                      value={newUser.fullName}
                      onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="supervisor@college.edu"
                      required
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Password (min 12 chars) *</label>
                    <input
                      type="password"
                      className="form-control"
                      required
                      minLength={12}
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={creatingUser}>
                    {creatingUser ? 'Creating...' : 'Create Account'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <span className="fw-semibold">System Users ({data.users.length})</span>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Active</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.users.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <div className="fw-semibold">{u.fullName || '-'}</div>
                          </td>
                          <td className="small">{u.email}</td>
                          <td>
                            <span className="badge bg-secondary">{u.role}</span>
                          </td>
                          <td>
                            <span className={`badge ${u.active ? 'bg-success' : 'bg-danger'}`}>
                              {u.active ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="text-end">
                            <button
                              className={`btn btn-sm me-2 ${u.active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                              onClick={() => handleToggleUserActive(u)}
                            >
                              {u.active ? 'Disable' : 'Enable'}
                            </button>
                            {u.role !== 'STUDENT' && u.role !== 'COMPANY' && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteUser(u.id)}
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Internships */}
      {activeTab === 'internships' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white">
            <span className="fw-semibold">All Internship Postings ({data.internships.length})</span>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Seats</th>
                    <th>Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {data.internships.map((i) => (
                    <tr key={i.id}>
                      <td className="fw-bold">{i.title}</td>
                      <td>{i.companyName}</td>
                      <td>{i.location}</td>
                      <td>
                        <span className="badge bg-info text-dark">
                          {i.acceptedCount} / {i.availableSeats} filled
                        </span>
                      </td>
                      <td className="small">{i.deadline}</td>
                    </tr>
                  ))}
                  {data.internships.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted p-4">
                        No internships posted.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Applications */}
      {activeTab === 'applications' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white">
            <span className="fw-semibold">All Applications ({data.applications.length})</span>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Internship</th>
                    <th>Company</th>
                    <th>Applied On</th>
                    <th>Document</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.applications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <div className="fw-bold">{app.studentName}</div>
                        <div className="small text-muted">{app.studentNumber}</div>
                      </td>
                      <td>{app.internshipTitle}</td>
                      <td>{app.companyName}</td>
                      <td className="small">{new Date(app.applicationDate).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => applicationService.download(app.documentPath)}
                        >
                          <i className="bi bi-download me-1"></i> CV
                        </button>
                      </td>
                      <td>
                        <StatusBadge status={app.status} />
                      </td>
                    </tr>
                  ))}
                  {data.applications.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-muted p-4">
                        No applications submitted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
