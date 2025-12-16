
import React from 'react';
import { fmt, fmtTime } from '../lib/helpers';


function UserIcon() {
  return (
    <span className="icon user-icon" aria-label="user" style={{ marginRight: 8 }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="4" fill="#6952e0" /><ellipse cx="10" cy="15.5" rx="6.5" ry="3.5" fill="#e2e8f0" /></svg>
    </span>
  );
}

function CalendarIcon() {
  return (
    <span className="icon calendar-icon" aria-label="calendar" style={{ marginRight: 6 }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="10" rx="2" fill="#e2e8f0" /><rect x="2" y="4" width="12" height="2" fill="#6952e0" /><rect x="5" y="8" width="2" height="2" fill="#6952e0" /><rect x="9" y="8" width="2" height="2" fill="#6952e0" /></svg>
    </span>
  );
}

function ClockIcon() {
  return (
    <span className="icon clock-icon" aria-label="clock" style={{ marginRight: 6 }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" fill="#e2e8f0" /><rect x="7.5" y="4" width="1" height="5" rx="0.5" fill="#6952e0" /><rect x="8" y="8" width="4" height="1" rx="0.5" fill="#6952e0" /></svg>
    </span>
  );
}

export default function EventCard({ event, timezone, onEdit, onViewLogs }) {
  return (
    <div className="event-card">
      <div className="event-users" style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <UserIcon />
        <span className="event-usernames" style={{ fontWeight: 600, fontSize: 17, color: '#6952e0' }}>
          {event.profiles?.map((p) => p.name).join(', ')}
        </span>
      </div>
      <div className="divider" />
      <div className="event-meta" style={{ margin: '16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CalendarIcon />
          <span style={{ fontWeight: 500, width: 45 }}>Start:</span>
          <span style={{ marginLeft: 6, width: 100 }}>{fmt(event.start, timezone)}</span>
          <span style={{ display: 'flex', alignItems: 'center', color: '#64748b' }}>
            <ClockIcon />
            <span>{fmtTime(event.start, timezone)}</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <CalendarIcon />
          <span style={{ fontWeight: 500, width: 45 }}>End:</span>
          <span style={{ marginLeft: 6, width: 100 }}>{fmt(event.end, timezone)}</span>
          <span style={{ display: 'flex', alignItems: 'center', color: '#64748b' }}>
            <ClockIcon />
            <span>{fmtTime(event.end, timezone)}</span>
          </span>
        </div>
      </div>
      <div className="divider" />
      <div className="event-meta" style={{ margin: '12px 0', color: '#64748b', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ minWidth: 60 }}>Created:</span>
          <span>{fmt(event.createdAt, timezone)} at {fmtTime(event.createdAt, timezone)}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ minWidth: 60 }}>Updated:</span>
          <span>{fmt(event.updatedAt, timezone)} at {fmtTime(event.updatedAt, timezone)}</span>
        </div>
      </div>
      <div className="divider" />
      <div className="actions" style={{ display: 'flex', gap: 12, marginTop: 18 }}>
        <button className="btn ghost" style={{ flex: 1 }} onClick={() => onEdit(event)}>Edit</button>
        <button className="btn ghost" style={{ flex: 1 }} onClick={() => onViewLogs(event)}>View logs</button>
      </div>
    </div>
  );
}
