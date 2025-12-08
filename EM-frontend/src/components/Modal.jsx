import React from 'react';

export default function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="btn ghost" onClick={onClose}>Close</button>
        </div>
        <div className="divider" />
        <div>{children}</div>
        {footer ? (
          <>
            <div className="divider" />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>{footer}</div>
          </>
        ) : null}
      </div>
    </div>
  );
}
