import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';

export default function DashboardLayout() {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />
      <div className="d-flex flex-grow-1">
        <Sidebar />
        <main className="flex-grow-1 p-3 p-md-4 overflow-auto" style={{ minWidth: 0, maxWidth: '100%' }}>
          <div className="container-fluid px-0" style={{ maxWidth: '1400px' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
