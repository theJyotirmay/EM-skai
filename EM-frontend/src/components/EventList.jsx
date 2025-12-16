import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { timezones } from '../lib/timezones';
import { useEvents } from '../store/useEvents';
import { useProfiles } from '../store/useProfiles';
import { fmt, fmtTime } from '../lib/helpers';
import EventCard from './EventCard';
import Modal from './Modal';
import EventFormBody from './EventFormBody';
import { useEventFormState } from '../hooks/useEventFormState';

// Initialize Day.js plugins for timezone support (needed for logs display)
dayjs.extend(utc);
dayjs.extend(timezone);

export default function EventList({ currentProfile }) {
  const { events, fetchEvents, updateEvent, fetchLogs, logs } = useEvents();
  const { profiles } = useProfiles();

  // View State
  const [viewingTimezone, setViewingTimezone] = useState('America/New_York');
  const [editingEvent, setEditingEvent] = useState(null);
  const [editProfiles, setEditProfiles] = useState([]);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  // Form logic for the Edit Modal
  const editFormState = useEventFormState(editingEvent);

  // Fetch events when profile or viewing timezone changes
  useEffect(() => {
    fetchEvents({ profileId: currentProfile?._id, timezone: viewingTimezone });
  }, [currentProfile, viewingTimezone, fetchEvents]);

  // Sync profiles when `editingEvent` changes
  useEffect(() => {
    if (editingEvent) {
      setEditProfiles(editingEvent.profiles || []);
    }
  }, [editingEvent]);

  const handleSubmitEdit = async () => {
    if (!editFormState.isValid() || !editingEvent) return;

    const { start, end } = editFormState.getISOValues();

    const payload = {
      timezone: editFormState.selectedTimezone,
      start,
      end,
      profiles: editProfiles.map((p) => p._id),
    };

    await updateEvent(editingEvent._id, payload);
    setEditingEvent(null);
    // Refresh list to show updates
    fetchEvents({ profileId: currentProfile?._id, timezone: viewingTimezone });
  };

  const handleViewLogs = async (event) => {
    await fetchLogs(event._id, viewingTimezone);
    setIsLogsModalOpen(true);
  };

  return (
    <>
      <h3 className="section-title" style={{ marginBottom: 4 }}>Events</h3>
      <div style={{ marginBottom: 16 }}>
        <label className="label" style={{ marginBottom: 6 }}>View in Timezone</label>
        <select className="select" value={viewingTimezone} onChange={(e) => setViewingTimezone(e.target.value)}>
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
              timezone={viewingTimezone}
              onEdit={setEditingEvent}
              onViewLogs={handleViewLogs}
            />
          ))}
        </div>
      )}

      {/* Edit Event Modal */}
      <Modal
        open={!!editingEvent}
        title="Edit Event"
        onClose={() => setEditingEvent(null)}
        footer={[
          <button key="cancel" className="btn ghost" onClick={() => setEditingEvent(null)}>Cancel</button>,
          <button key="save" className="btn primary" onClick={handleSubmitEdit}>Update Event</button>,
        ]}
      >
        {editingEvent && (
          <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
            <EventFormBody
              profiles={editProfiles}
              onProfilesChange={setEditProfiles}
              {...editFormState}
            />
          </div>
        )}
      </Modal>

      {/* Logs Modal */}
      <Modal open={isLogsModalOpen} title="Update Logs" onClose={() => setIsLogsModalOpen(false)}>
        {logs.length === 0 ? (
          <div className="empty-state">No logs yet</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {logs.map((log, idx) => (
              <div key={idx} style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e293b' }}>
                  {dayjs(log.timestamp).tz(viewingTimezone).format('MMM D, YYYY [at] hh:mm A')}
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
                          Updated start time from <strong>{fmt(val.from, viewingTimezone)} {fmtTime(val.from, viewingTimezone)}</strong> to <strong>{fmt(val.to, viewingTimezone)} {fmtTime(val.to, viewingTimezone)}</strong>
                        </div>
                      );
                    }
                    if (key === 'end') {
                      return (
                        <div key={key} style={{ color: '#475569' }}>
                          Updated end time from <strong>{fmt(val.from, viewingTimezone)} {fmtTime(val.from, viewingTimezone)}</strong> to <strong>{fmt(val.to, viewingTimezone)} {fmtTime(val.to, viewingTimezone)}</strong>
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