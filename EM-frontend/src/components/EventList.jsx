import React, { useEffect, useState } from 'react';
import { timezones } from '../lib/timezones';
import { useEvents } from '../store/useEvents';
import EventCard from './EventCard';
import Modal from './Modal';
import { useRef } from 'react';
import ProfileDropdown from './ProfileDropdown';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

// need timezone support for proper date display
dayjs.extend(utc);
dayjs.extend(timezone);

export default function EventList({ currentProfile }) {
  const { events, fetchEvents, updateEvent, fetchLogs, logs, viewTimezone } = useEvents();
  const [tz, setTz] = useState('UTC');  // viewing timezone
  const [editing, setEditing] = useState(null);  // event being edited
  const [editState, setEditState] = useState(null);
  const [logsOpen, setLogsOpen] = useState(false);

  useEffect(() => {
    const tzDefault = 'America/New_York';
    setTz(tzDefault);
    fetchEvents({ profileId: currentProfile?._id, timezone: tzDefault });
  }, [currentProfile, fetchEvents]);

  // Edit modal state and refs
  const [editStart, setEditStart] = useState('');
  const [editStartTime, setEditStartTime] = useState('09:00');
  const [editEnd, setEditEnd] = useState('');
  const [editEndTime, setEditEndTime] = useState('09:00');
  const editStartDateRef = useRef(null);
  const editStartTimeRef = useRef(null);
  const editEndDateRef = useRef(null);
  const editEndTimeRef = useRef(null);
  const editStartDatePicker = useRef(null);
  const editStartTimePicker = useRef(null);
  const editEndDatePicker = useRef(null);
  const editEndTimePicker = useRef(null);

  const openEdit = (event) => {
    setEditing(event);
    setEditState({
      timezone: event.timezone,
      profiles: event.profiles || [],
    });
    
    // parse dates from event in its original timezone
    const startDt = dayjs(event.start).tz(event.timezone);
    const endDt = dayjs(event.end).tz(event.timezone);
    setEditStart(startDt.format('YYYY-MM-DD'));
    setEditStartTime(startDt.format('HH:mm'));
    setEditEnd(endDt.format('YYYY-MM-DD'));
    setEditEndTime(endDt.format('HH:mm'));
  };

  const submitEdit = async () => {
    const tzVal = editState.timezone;
    const startDateTime = dayjs.tz(`${editStart} ${editStartTime}`, 'YYYY-MM-DD HH:mm', tzVal).toISOString();
    const endDateTime = dayjs.tz(`${editEnd} ${editEndTime}`, 'YYYY-MM-DD HH:mm', tzVal).toISOString();
    
    const payload = {
      title: `Event on ${editStart}`,
      timezone: tzVal,
      start: startDateTime,
      end: endDateTime,
      profiles: editState.profiles.map((p) => p._id),
    };
    
    await updateEvent(editing._id, payload);
    setEditing(null);
    fetchEvents({ profileId: currentProfile?._id, timezone: tz });  // refresh the list
  };

  const openLogs = async (event) => {
    await fetchLogs(event._id, tz);
    setLogsOpen(true);
  };

  const changeViewTz = (newTz) => {
    setTz(newTz);
    fetchEvents({ profileId: currentProfile?._id, timezone: newTz });  // refetch with new timezone
  };

  return (
    <>
      <h3 className="section-title" style={{ marginBottom: 4 }}>Events</h3>
      <div style={{ marginBottom: 16 }}>
        <label className="label" style={{ marginBottom: 6 }}>View in Timezone</label>
        <select className="select" value={tz} onChange={(e) => changeViewTz(e.target.value)}>
          {timezones
            .filter((t) => t.value !== 'UTC')
            .map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
        </select>
      </div>

      {!currentProfile ? (
        <div className="empty-state">Choose a profile to see events</div>
      ) : events.length === 0 ? (
        <div className="empty-state">No events found</div>
      ) : (
        <div style={{ marginTop: 12 }}>
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              timezone={tz}
              onEdit={openEdit}
              onViewLogs={openLogs}
            />
          ))}
        </div>
      )}

      <Modal
        open={!!editing}
        title="Edit Event"
        onClose={() => setEditing(null)}
        footer={[
          <button key="cancel" className="btn ghost" onClick={() => setEditing(null)}>Cancel</button>,
          <button key="save" className="btn primary" onClick={submitEdit}>Update Event</button>,
        ]}
      >
        {editing && editState && (
          <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
            <div>
              <label className="label">Profiles</label>
              <ProfileDropdown
                multi
                selected={editState.profiles}
                onChange={(list) => setEditState({ ...editState, profiles: list })}
              />
            </div>
            <div>
              <label className="label">Timezone</label>
              <select
                className="select"
                value={editState.timezone}
                onChange={(e) => setEditState({ ...editState, timezone: e.target.value })}
              >
                {timezones.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="label">Start Date &amp; Time</label>
              <div className="picker-row">
                <div className="picker-control" onClick={() => editStartDatePicker.current?.open?.()}>
                  <span className="picker-icon">📅</span>
                  <span>{editStart ? dayjs(editStart).format('MMM D, YYYY') : 'Pick a date'}</span>
                  <input ref={editStartDateRef} type="text" className="picker-hidden" readOnly />
                </div>
                <div className="picker-control" onClick={() => editStartTimePicker.current?.open?.()}>
                  <span className="picker-icon">🕐</span>
                  <span>{editStartTime ? dayjs(`2000-01-01 ${editStartTime}`, 'YYYY-MM-DD HH:mm').format('hh:mm A') : 'Pick a time'}</span>
                  <input ref={editStartTimeRef} type="text" className="picker-hidden" readOnly />
                </div>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="label">End Date &amp; Time</label>
              <div className="picker-row">
                <div className="picker-control" onClick={() => editEndDatePicker.current?.open?.()}>
                  <span className="picker-icon">📅</span>
                  <span>{editEnd ? dayjs(editEnd).format('MMM D, YYYY') : 'Pick a date'}</span>
                  <input ref={editEndDateRef} type="text" className="picker-hidden" readOnly />
                </div>
                <div className="picker-control" onClick={() => editEndTimePicker.current?.open?.()}>
                  <span className="picker-icon">🕐</span>
                  <span>{editEndTime ? dayjs(`2000-01-01 ${editEndTime}`, 'YYYY-MM-DD HH:mm').format('hh:mm A') : 'Pick a time'}</span>
                  <input ref={editEndTimeRef} type="text" className="picker-hidden" readOnly />
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={logsOpen} title="Update Logs" onClose={() => setLogsOpen(false)}>
        {logs.length === 0 ? (
          <div className="empty-state">No logs yet</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {logs.map((log, idx) => {
              const changesText = Object.entries(log.changes || {})
                .map(([field]) => field)
                .join(', ');
              return (
                <div key={idx} style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    {dayjs(log.timestamp).tz(tz).format('MMM D, YYYY [at] hh:mm A')}
                  </div>
                  <div style={{ color: '#64748b', fontSize: 14 }}>
                    Updated {changesText}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
      </>
    );
  }