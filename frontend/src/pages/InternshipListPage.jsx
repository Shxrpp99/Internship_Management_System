import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as internshipService from '../services/internshipService';
import { errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import Loading from '../components/Loading.jsx';
import Msg from '../components/Msg.jsx';

export default function InternshipListPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ title: '', company: '', location: '', deadline: '' });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({});

  const load = (f = filters) => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(f).filter(([, v]) => v));
    internshipService
      .list(params)
      .then((r) => setItems(r.data || []))
      .catch((e) => setMsg({ error: errMsg(e) }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });
  const today = new Date().toISOString().slice(0, 10);

  const handleClear = () => {
    const empty = { title: '', company: '', location: '', deadline: '' };
    setFilters(empty);
    load(empty);
  };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h2 className="fw-bold mb-1">Browse Internships</h2>
          <p className="text-muted mb-0">Discover and apply for approved industry internships</p>
        </div>
      </div>

      <Msg msg={msg} onClose={() => setMsg({})} />

      {/* Filter Card */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-3">
          <form
            className="row g-2 align-items-center"
            onSubmit={(e) => {
              e.preventDefault();
              load();
            }}
          >
            <div className="col-md-3">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Filter by title..."
                  value={filters.title}
                  onChange={handleChange('title')}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light"><i className="bi bi-buildings"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Filter by company..."
                  value={filters.company}
                  onChange={handleChange('company')}
                />
              </div>
            </div>
            <div className="col-md-2">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light"><i className="bi bi-geo-alt"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Location..."
                  value={filters.location}
                  onChange={handleChange('location')}
                />
              </div>
            </div>
            <div className="col-md-2">
              <input
                type="date"
                className="form-control form-control-sm"
                title="Deadline before or on"
                value={filters.deadline}
                onChange={handleChange('deadline')}
              />
            </div>
            <div className="col-md-2 d-flex gap-2">
              <button type="submit" className="btn btn-primary btn-sm flex-fill">
                Search
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={handleClear}
                title="Reset filters"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>

      {loading ? (
        <Loading message="Fetching available internships..." />
      ) : items.length === 0 ? (
        <div className="card shadow-sm border-0 p-5 text-center text-muted">
          <i className="bi bi-search fs-1 text-secondary mb-2"></i>
          <h5>No internships found</h5>
          <p className="mb-0">Try clearing filters or search criteria.</p>
        </div>
      ) : (
        <div className="row g-3">
          {items.map((item) => {
            const expired = item.deadline < today;
            const full = item.acceptedCount >= item.availableSeats;
            return (
              <div className="col-md-6 col-xl-4" key={item.id}>
                <div className="card h-100 shadow-sm border-0 d-flex flex-column">
                  <div className="card-body flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title fw-bold text-dark mb-0">{item.title}</h5>
                    </div>
                    <h6 className="text-muted d-flex align-items-center gap-1 mb-3">
                      <i className="bi bi-building"></i>
                      <span>{item.companyName}</span>
                      <span>&middot;</span>
                      <i className="bi bi-geo-alt"></i>
                      <span>{item.location}</span>
                    </h6>

                    <p className="small text-muted mb-3 line-clamp-2" style={{ maxHeight: '3.6em', overflow: 'hidden' }}>
                      {item.description || 'No description provided.'}
                    </p>

                    <div className="mb-2">
                      <div className="d-flex justify-content-between small text-muted mb-1">
                        <span>Capacity:</span>
                        <span className="fw-semibold">
                          {item.acceptedCount} / {item.availableSeats} filled
                        </span>
                      </div>
                      <div className="progress" style={{ height: '6px' }}>
                        <div
                          className={`progress-bar ${full ? 'bg-danger' : 'bg-success'}`}
                          style={{
                            width: `${Math.min(100, (item.acceptedCount / item.availableSeats) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2 small mt-3">
                      <i className="bi bi-calendar-event text-secondary"></i>
                      <span>Deadline: {item.deadline}</span>
                      {expired && <span className="badge bg-danger">Closed</span>}
                      {full && <span className="badge bg-secondary">Full</span>}
                    </div>
                  </div>

                  <div className="card-footer bg-white border-0 pt-0 pb-3 d-flex gap-2">
                    <Link
                      to={`/internships/${item.id}`}
                      className="btn btn-outline-primary btn-sm flex-fill"
                    >
                      View Details
                    </Link>
                    {user?.role === 'STUDENT' && !expired && !full && (
                      <Link
                        to={`/internships/${item.id}/apply`}
                        className="btn btn-primary btn-sm flex-fill"
                      >
                        Apply Now
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
