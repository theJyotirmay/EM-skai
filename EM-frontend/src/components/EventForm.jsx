import React from 'react';
import { useEvents } from '../store/useEvents';
import { useEventFormState } from '../hooks/useEventFormState';
import EventFormBody from './EventFormBody';

export default function EventForm({ profilesSelected, onProfilesChange, onCreated }) {
  const { createEvent } = useEvents();


  const formState = useEventFormState();

  const handleSubmit = async (e) => {
    e.preventDefault();


    if (!profilesSelected || profilesSelected.length === 0) {
      return;
    }

    if (!formState.isValid()) {
      return;
    }


    const { start, end } = formState.getISOValues();

    const newEvent = {
      timezone: formState.selectedTimezone,
      start,
      end,
      profiles: profilesSelected.map((p) => p._id),
    };

    const createdEvent = await createEvent(newEvent);


    formState.resetForm();
    onCreated?.(createdEvent);
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <EventFormBody
        profiles={profilesSelected}
        onProfilesChange={onProfilesChange}
        {...formState}
      />
      <button className="btn primary" type="submit" style={{ marginTop: 16, width: '100%' }}>+ Create Event</button>
    </form>
  );
}
