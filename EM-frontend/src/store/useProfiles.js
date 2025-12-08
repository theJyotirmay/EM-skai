import { create } from 'zustand';
import api from '../lib/api';

// profiles store - manages user profiles
export const useProfiles = create((set, get) => ({
  profiles: [],
  currentProfile: null,  // the currently selected profile
  loading: false,
  error: null,
  
  // fetch all profiles from server
  async fetchProfiles() {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/profiles');
      set({ profiles: res.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
  
  // create new profile
  async addProfile(payload) {
    const res = await api.post('/profiles', payload);
    // add to list and set as current
    set({
      profiles: [res.data, ...get().profiles],
      currentProfile: res.data
    });
    return res.data;
  },
  
  // update an existing profile
  async updateProfile(id, payload) {
    const res = await api.patch(`/profiles/${id}`, payload);
    set({
      profiles: get().profiles.map((p) => (p._id === id ? res.data : p)),
      currentProfile: get().currentProfile?._id === id ? res.data : get().currentProfile,
    });
    return res.data;
  },
  
  // set which profile is currently active
  setCurrent(profile) {
    set({ currentProfile: profile });
  },
}));
