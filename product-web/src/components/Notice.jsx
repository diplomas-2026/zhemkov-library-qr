export default function Notice({ type = 'info', title, children, onClose }) {
  const className = `notice notice-${type}`;
  return (
    <div className={className} role={type === 'error' ? 'alert' : 'status'}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'grid', gap: 6 }}>
          {title && <strong style={{ fontSize: 14 }}>{title}</strong>}
          {children && <div style={{ color: 'rgba(23,20,18,0.78)' }}>{children}</div>}
        </div>
        {onClose && (
          <button type="button" className="btn btn-ghost" onClick={onClose} aria-label="Закрыть уведомление">
            Закрыть
          </button>
        )}
      </div>
    </div>
  );
}

