export default function StatusBadge({ status }) {
  if (!status) return null;

  const colorMap = {
    PENDING: 'warning text-dark',
    ACCEPTED: 'success',
    APPROVED: 'success',
    REJECTED: 'danger',
    SUBMITTED: 'info text-dark',
    REVIEWED: 'success',
    CHANGES_REQUESTED: 'warning text-dark',
    ACTIVE: 'primary',
    COMPLETED: 'secondary',
  };

  const badgeClass = colorMap[status] || 'secondary';
  const label = status.replaceAll('_', ' ');

  return (
    <span className={`badge bg-${badgeClass} text-uppercase px-2 py-1`}>
      {label}
    </span>
  );
}
