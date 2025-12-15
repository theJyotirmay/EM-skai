import React, { useEffect, useState } from 'react';
import ProfileDropdown from './components/ProfileDropdown';
import EventForm from './components/EventForm';
import EventList from './components/EventList';
import { useProfiles } from './store/useProfiles';
import { useEvents } from './store/useEvents';

export default function App() {
  const { currentProfile, setCurrent, fetchProfiles } = useProfiles();
  const { toast, clearToast } = useEvents();
  const [formProfiles, setFormProfiles] = useState([]);  // profiles selected for new event

  const [isExiting, setIsExiting] = useState(false);

  // load all profiles when component mounts
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // auto-dismiss toast
  useEffect(() => {
    if (toast) {
      setIsExiting(false);
      const exitTimer = setTimeout(() => setIsExiting(true), 2000);
      const removeTimer = setTimeout(() => clearToast(), 2400);
      return () => {
        clearTimeout(exitTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [toast, clearToast]);

  return (
    <div className="app-shell">
      <div className="header">
        <div>
          <h1>Event Management</h1>
          <p className="subtitle">Create and manage events across multiple time-zones</p>
        </div>
        <div style={{ minWidth: 260 }}>
          <ProfileDropdown
            selected={currentProfile}
            onChange={(p) => setCurrent(p)}
            label="Select current profile"
          />
        </div>
      </div>

      <div className="grid">
        <EventForm
          profilesSelected={formProfiles}
          onProfilesChange={setFormProfiles}
          onCreated={() => setFormProfiles([])}
        />
        <div className="card">
          <EventList currentProfile={currentProfile} />
        </div>
      </div>

      {toast && (
        <div className={`toast ${isExiting ? 'exiting' : ''}`} onClick={() => { setIsExiting(true); setTimeout(clearToast, 400); }}>
          {toast}
        </div>
      )}
    </div>
  );
}
