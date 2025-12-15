import React, { useEffect, useState } from 'react';
import { timezones } from '../lib/timezones';
import { useEvents } from '../store/useEvents';
import { useProfiles } from '../store/useProfiles';
import { fmt, fmtTime } from '../lib/helpers';
import EventCard from './EventCard';
import Modal from './Modal';
import { useRef } from 'react';
import ProfileDropdown from './ProfileDropdown';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

// need timezone support for proper date display
dayjs.extend(utc);
dayjs.extend(timezone);

export default function EventList({ currentProfile }) {
  const { events, fetchEvents, updateEvent, fetchLogs, logs, viewTimezone } = useEvents();
  const { profiles } = useProfiles();
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

  // Initialize flatpickr when edit modal opens
  useEffect(() => {
    if (!editing) return;

    // Small delay to ensure refs are attached to DOM
    const timer = setTimeout(() => {
      // Start date picker
      if (editStartDateRef.current) {
        editStartDatePicker.current = flatpickr(editStartDateRef.current, {
          altInput: true,
          altFormat: 'M j, Y',
          dateFormat: 'Y-m-d',
          defaultDate: editStart || null,
          minDate: 'today',  // prevent past dates
          onChange: (selectedDates) => {
            const v = selectedDates?.[0] ? dayjs(selectedDates[0]).format('YYYY-MM-DD') : '';
            setEditStart(v);

            // if new start date is after current end date, reset end date
            if (editEnd && v && dayjs(v).isAfter(dayjs(editEnd))) {
              setEditEnd('');
              if (editEndDatePicker.current) {
                editEndDatePicker.current.setDate(null);
              }
            }

            // update minDate for end picker
            if (editEndDatePicker.current) {
              editEndDatePicker.current.set('minDate', v || 'today');
            }
          },
        });
      }

      // Start time picker
      if (editStartTimeRef.current) {
        editStartTimePicker.current = flatpickr(editStartTimeRef.current, {
          enableTime: true,
          noCalendar: true,
          dateFormat: 'H:i',
          altInput: true,
          altFormat: 'h:i K',
          defaultDate: `2000-01-01 ${editStartTime}`,
          minuteIncrement: 15,
          onChange: (selectedDates, str) => {
            const timeStr = str || dayjs(selectedDates?.[0]).format('HH:mm');
            setEditStartTime(timeStr);

            // if same day, auto adjust end time if invalid
            if (editStart === editEnd) {
              // ... logic similar to create form
            }
          },
        });
      }

      // End date picker
      if (editEndDateRef.current) {
        editEndDatePicker.current = flatpickr(editEndDateRef.current, {
          altInput: true,
          altFormat: 'M j, Y',
          dateFormat: 'Y-m-d',
          defaultDate: editEnd || null,
          minDate: editStart || 'today', // can't be before start
          onChange: (selectedDates) => {
            const v = selectedDates?.[0] ? dayjs(selectedDates[0]).format('YYYY-MM-DD') : '';
            setEditEnd(v);
          },
        });
      }

      // End time picker
      if (editEndTimeRef.current) {
        editEndTimePicker.current = flatpickr(editEndTimeRef.current, {
          enableTime: true,
          noCalendar: true,
          dateFormat: 'H:i',
          altInput: true,
          altFormat: 'h:i K',
          defaultDate: `2000-01-01 ${editEndTime}`,
          minuteIncrement: 15,
          onChange: (selectedDates, str) => {
            setEditEndTime(str || dayjs(selectedDates?.[0]).format('HH:mm'));
          },
        });
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      editStartDatePicker.current?.destroy();
      editStartTimePicker.current?.destroy();
      editEndDatePicker.current?.destroy();
      editEndTimePicker.current?.destroy();
    };
  }, [editing]);

  const submitEdit = async () => {
    const tzVal = editState.timezone;
    const startDateTime = dayjs.tz(`${editStart} ${editStartTime}`, 'YYYY-MM-DD HH:mm', tzVal).toISOString();
    const endDateTime = dayjs.tz(`${editEnd} ${editEndTime}`, 'YYYY-MM-DD HH:mm', tzVal).toISOString();

    const payload = {
      title: editing.title,
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
            {logs.map((log, idx) => (
              <div key={idx} style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e293b' }}>
                  {dayjs(log.timestamp).tz(tz).format('MMM D, YYYY [at] hh:mm A')}
                </div>
                <div style={{ fontSize: 13, gap: 4, display: 'flex', flexDirection: 'column' }}>
                  {Object.entries(log.changes || {}).map(([key, val]) => {
                    if (key === 'timezone') {
                      const fromLabel = timezones.find(t => t.value === val.from)?.label || val.from;
                      const toLabel = timezones.find(t => t.value === val.to)?.label || val.to;
                      return (
                        <div key={key} style={{ color: '#475569' }}>
                          Updated timezone from <strong>{fromLabel}</strong> to <strong>{toLabel}</strong>
                        </div>
                      );
                    }
                    if (key === 'start') {
                      return (
                        <div key={key} style={{ color: '#475569' }}>
                          Updated start time from <strong>{fmt(val.from, tz)} {fmtTime(val.from, tz)}</strong> to <strong>{fmt(val.to, tz)} {fmtTime(val.to, tz)}</strong>
                        </div>
                      );
                    }
                    if (key === 'end') {
                      return (
                        <div key={key} style={{ color: '#475569' }}>
                          Updated end time from <strong>{fmt(val.from, tz)} {fmtTime(val.from, tz)}</strong> to <strong>{fmt(val.to, tz)} {fmtTime(val.to, tz)}</strong>
                        </div>
                      );
                    }
                    if (key === 'profiles') {
                      return (
                        <div key={key} style={{ color: '#475569' }}>
                          Updated participant list
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}