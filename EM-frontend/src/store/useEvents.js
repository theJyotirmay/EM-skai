import { create } from 'zustand';
import api from '../lib/api';

// event store - handles all event operations and state
export const useEvents = create((set, get) => ({
  events: [],
  logs: [],
  loading: false,
  error: null,
  toast: null,  // success notifications
  viewTimezone: 'UTC',
  
  // fetch events with optional profile filter
  async fetchEvents({ profileId, timezone }) {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/events', {
        params: { profileId, timezone },
      });
      set({
        events: res.data,
        loading: false,
        viewTimezone: timezone || 'UTC'
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
  
  // create a new event
  async createEvent(payload) {
    const res = await api.post('/events', payload);
    set({ toast: 'Event created successfully' });
    return res.data;
  },
  
  // update an existing event
  async updateEvent(id, payload) {
    const res = await api.patch(`/events/${id}`, payload);
    set({ toast: 'Event updated successfully' });
    // keep local state in sync with server
    set({
      events: get().events.map((e) => (e._id === id ? res.data : e)),
    });
    return res.data;
  },
  
  // fetch the audit log for an event
  async fetchLogs(id, timezone) {
    const res = await api.get(`/events/${id}/logs`, { params: { timezone } });
    set({ logs: res.data });
    return res.data;
  },
  
  clearToast() {
    set({ toast: null });
  },
}));
