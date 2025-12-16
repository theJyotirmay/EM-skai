import { create } from 'zustand';
import api from '../lib/api';


export const useEvents = create((set, get) => ({
  events: [],
  logs: [],
  loading: false,
  error: null,
  toast: null,
  viewTimezone: 'UTC',


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


  async createEvent(payload) {
    const res = await api.post('/events', payload);
    set((state) => ({
      toast: 'Event created successfully',
      events: [res.data, ...state.events]
    }));
    return res.data;
  },


  async updateEvent(id, payload) {
    const res = await api.patch(`/events/${id}`, payload);
    set({ toast: 'Event updated successfully' });

    set({
      events: get().events.map((e) => (e._id === id ? res.data : e)),
    });
    return res.data;
  },


  async fetchLogs(id, timezone) {
    const res = await api.get(`/events/${id}/logs`, { params: { timezone } });
    set({ logs: res.data });
    return res.data;
  },

  clearToast() {
    set({ toast: null });
  },
}));
