export default function Msg({ msg, onClose }) {
  if (!msg || (!msg.error && !msg.success && !msg.info)) return null;

  let type = 'danger';
  let text = msg.error;

  if (msg.success) {
    type = 'success';
    text = msg.success;
  } else if (msg.info) {
    type = 'info';
    text = msg.info;
  }

  return (
    <div className={`alert alert-${type} alert-dismissible fade show my-3 shadow-sm`} role="alert">
      <div className="d-flex align-items-center">
        {type === 'success' && <i className="bi bi-check-circle-fill me-2 fs-5"></i>}
        {type === 'danger' && <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>}
        {type === 'info' && <i className="bi bi-info-circle-fill me-2 fs-5"></i>}
        <div>{text}</div>
      </div>
      {onClose && (
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={onClose}
        />
      )}
    </div>
  );
}
