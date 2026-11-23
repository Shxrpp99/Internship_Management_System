export default function StatCard({ title, value, icon, color = 'primary' }) {
  return (
    <div className="card h-100 shadow-sm border-0">
      <div className="card-body d-flex align-items-center">
        <div
          className={`d-flex align-items-center justify-content-center rounded-3 bg-${color}-subtle text-${color} me-3`}
          style={{ width: '48px', height: '48px', minWidth: '48px' }}
        >
          {icon ? <i className={`bi ${icon} fs-4`}></i> : <i className="bi bi-bar-chart-fill fs-4"></i>}
        </div>
        <div className="overflow-hidden">
          <div className="text-muted small text-uppercase fw-semibold text-truncate">{title}</div>
          <div className="fs-3 fw-bold text-dark">{value ?? 0}</div>
        </div>
      </div>
    </div>
  );
}
