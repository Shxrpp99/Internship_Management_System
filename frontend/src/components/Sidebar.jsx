import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const NAVIGATION = {
  STUDENT: [
    { to: '/student', label: 'Dashboard', icon: 'bi-speedometer2' },
    { to: '/internships', label: 'Browse Internships', icon: 'bi-briefcase' },
    { to: '/my-applications', label: 'My Applications', icon: 'bi-file-earmark-text' },
    { to: '/reports', label: 'Weekly Reports', icon: 'bi-journal-check' },
    { to: '/feedback', label: 'Supervisor Feedback', icon: 'bi-chat-left-dots' },
    { to: '/evaluations', label: 'Evaluations', icon: 'bi-star' },
  ],
  COMPANY: [
    { to: '/company', label: 'Dashboard & Postings', icon: 'bi-buildings' },
    { to: '/internships', label: 'All Internships', icon: 'bi-briefcase' },
    { to: '/evaluations', label: 'Intern Evaluations', icon: 'bi-award' },
  ],
  SUPERVISOR: [
    { to: '/supervisor', label: 'My Assigned Students', icon: 'bi-people' },
    { to: '/reports', label: 'Review Progress Reports', icon: 'bi-journal-check' },
    { to: '/evaluations', label: 'Submit Evaluations', icon: 'bi-award' },
  ],
  ADMIN: [
    { to: '/admin', label: 'Admin Console', icon: 'bi-shield-check' },
    { to: '/internships', label: 'All Internships', icon: 'bi-briefcase' },
    { to: '/evaluations', label: 'All Evaluations', icon: 'bi-award' },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const items = NAVIGATION[user.role] || [];

  return (
    <aside className="ims-sidebar py-3">
      <div className="px-3 mb-2 text-uppercase text-muted fw-bold" style={{ fontSize: '0.72rem', letterSpacing: '0.08em' }}>
        Main Menu
      </div>
      <div className="list-group list-group-flush">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/student' || item.to === '/company' || item.to === '/supervisor' || item.to === '/admin'}
            className={({ isActive }) =>
              `list-group-item list-group-item-action ${isActive ? 'active' : ''}`
            }
          >
            <i className={`bi ${item.icon} fs-5`}></i>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
