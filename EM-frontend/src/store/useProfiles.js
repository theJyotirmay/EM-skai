import { create } from 'zustand';
import api from '../lib/api';


export const useProfiles = create((set, get) => ({
  profiles: [],
  currentProfile: null,
  loading: false,
  error: null,


  async fetchProfiles() {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/profiles');
      set({ profiles: res.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },


  async addProfile(payload) {
    const res = await api.post('/profiles', payload);

    set({
      profiles: [res.data, ...get().profiles],
      currentProfile: res.data
    });
    return res.data;
  },


  async updateProfile(id, payload) {
    const res = await api.patch(`/profiles/${id}`, payload);
    set({
      profiles: get().profiles.map((p) => (p._id === id ? res.data : p)),
      currentProfile: get().currentProfile?._id === id ? res.data : get().currentProfile,
    });
    return res.data;
  },


  setCurrent(profile) {
    set({ currentProfile: profile });
  },
}));
