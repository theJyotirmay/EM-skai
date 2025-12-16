import React, { useEffect, useState } from 'react';
import ProfileDropdown from './components/ProfileDropdown';
import EventForm from './components/EventForm';
import EventList from './components/EventList';
import { useProfiles } from './store/useProfiles';
import { useEvents } from './store/useEvents';

export default function App() {
  const { currentProfile, setCurrent: setCurrentProfile, fetchProfiles } = useProfiles();
  const { toast, clearToast } = useEvents();

  // State for profiles selected in the creating form
  const [selectedEventProfiles, setSelectedEventProfiles] = useState([]);
  const [isToastExiting, setIsToastExiting] = useState(false);

  // Load all profiles when component mounts
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Auto-dismiss toast notifications
  useEffect(() => {
    if (toast) {
      setIsToastExiting(false);
      const exitTimer = setTimeout(() => setIsToastExiting(true), 2000);
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
            onChange={(profile) => setCurrentProfile(profile)}
            label="Select current profile"
          />
        </div>
      </div>

      <div className="grid">
        <EventForm
          profilesSelected={selectedEventProfiles}
          onProfilesChange={setSelectedEventProfiles}
          onCreated={() => setSelectedEventProfiles([])}
        />
        <div className="card">
          <EventList currentProfile={currentProfile} />
        </div>
      </div>

      {toast && (
        <div
          className={`toast ${isToastExiting ? 'exiting' : ''}`}
          onClick={() => { setIsToastExiting(true); setTimeout(clearToast, 400); }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
