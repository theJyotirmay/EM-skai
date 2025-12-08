import React, { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { timezones } from '../lib/timezones';
import { useEvents } from '../store/useEvents';
import ProfileDropdown from './ProfileDropdown';

// need dayjs timezone plugins for proper handling
dayjs.extend(utc);
dayjs.extend(timezone);

export default function EventForm({ profilesSelected, onProfilesChange, onCreated }) {
  const { createEvent } = useEvents();
  const [tz, setTz] = useState('America/New_York');  // default timezone
  const [start, setStart] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [end, setEnd] = useState('');
  const [endTime, setEndTime] = useState('09:00');
  const [error, setError] = useState(null);
  
  // ensure end time is after start if same day
  const enforceEndTime = (nextEndTime) => {
    if (start && end && start === end) {
      const s = dayjs(`2000-01-01 ${startTime}`, 'YYYY-MM-DD HH:mm');
      const e = dayjs(`2000-01-01 ${nextEndTime}`, 'YYYY-MM-DD HH:mm');
      if (e.isBefore(s)) {
        setEndTime(startTime);
        return;
      }
    }
    setEndTime(nextEndTime);
  };
  const startDateRef = useRef(null);
  const startTimeRef = useRef(null);
  const endDateRef = useRef(null);
  const endTimeRef = useRef(null);
  const startDatePicker = useRef(null);
  const startTimePicker = useRef(null);
  const endDatePicker = useRef(null);
  const endTimePicker = useRef(null);

  // initialize all pickers on component mount
  useEffect(() => {
    // start date picker setup
    startDatePicker.current = flatpickr(startDateRef.current, {
      altInput: true,
      altFormat: 'M j, Y',
      dateFormat: 'Y-m-d',
      defaultDate: start || null,
      minDate: 'today',
      onChange: (selectedDates) => {
        const v = selectedDates?.[0] ? dayjs(selectedDates[0]).format('YYYY-MM-DD') : '';
        setStart(v);
        // if new start date is after current end date, clear the end
        if (end && v && dayjs(v).isAfter(dayjs(end))) {
          setEnd('');
        }
      },
    });

    // end date picker setup
    endDatePicker.current = flatpickr(endDateRef.current, {
      altInput: true,
      altFormat: 'M j, Y',
      dateFormat: 'Y-m-d',
      defaultDate: end || null,
      minDate: start || 'today',
      onChange: (selectedDates) => {
        const v = selectedDates?.[0] ? dayjs(selectedDates[0]).format('YYYY-MM-DD') : '';
        setEnd(v);
      },
    });

    // start time picker - 15 min increments
    startTimePicker.current = flatpickr(startTimeRef.current, {
      enableTime: true,
      noCalendar: true,
      dateFormat: 'H:i',
      altInput: true,
      altFormat: 'h:i K',
      defaultDate: `2000-01-01 ${startTime}`,
      minuteIncrement: 15,
      onChange: (selectedDates, str) => {
        const timeStr = str || dayjs(selectedDates?.[0]).format('HH:mm');
        setStartTime(timeStr);
        // if same day, adjust end time if it's now before start
        if (end && start === end) {
          const sMoment = dayjs(`2000-01-01 ${timeStr}`, 'YYYY-MM-DD HH:mm');
          const eMoment = dayjs(`2000-01-01 ${endTime}`, 'YYYY-MM-DD HH:mm');
          if (eMoment.isBefore(sMoment)) {
            setEndTime(timeStr);
          }
        }
      },
    });

    // end time picker
    endTimePicker.current = flatpickr(endTimeRef.current, {
      enableTime: true,
      noCalendar: true,
      dateFormat: 'H:i',
      altInput: true,
      altFormat: 'h:i K',
      defaultDate: `2000-01-01 ${endTime}`,
      minuteIncrement: 15,
      onChange: (selectedDates, str) => {
        const timeStr = str || dayjs(selectedDates?.[0]).format('HH:mm');
        enforceEndTime(timeStr);
      },
    });

    // cleanup pickers when component unmounts
    return () => {
      startDatePicker.current?.destroy();
      endDatePicker.current?.destroy();
      startTimePicker.current?.destroy();
      endTimePicker.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (endDatePicker.current) {
      endDatePicker.current.set('minDate', start || 'today');
    }
    if (endTimePicker.current) {
      const sameDay = start && end && start === end;
      endTimePicker.current.set('minTime', sameDay ? startTime : null);
    }
  }, [start, end, startTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // basic validation - need profiles and dates filled
    if (!profilesSelected || profilesSelected.length === 0) {
      return;
    }
    if (!start || !end) {
      return;
    }
    
    // convert times to ISO strings with timezone info
    const startDateTime = dayjs.tz(`${start} ${startTime}`, 'YYYY-MM-DD HH:mm', tz).toISOString();
    const endDateTime = dayjs.tz(`${end} ${endTime}`, 'YYYY-MM-DD HH:mm', tz).toISOString();
    
    if (dayjs(endDateTime).isBefore(dayjs(startDateTime))) {
      return;  // sanity check - end can't be before start
    }
    
    const payload = {
      title: `Event on ${start}`,
      timezone: tz,
      start: startDateTime,
      end: endDateTime,
      profiles: profilesSelected.map((p) => p._id),
    };
    
    const event = await createEvent(payload);
    
    // reset form for next entry
    setStart('');
    setEnd('');
    setStartTime('09:00');
    setEndTime('09:00');
    onCreated?.(event);
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <label className="label">Profiles</label>
      <ProfileDropdown multi selected={profilesSelected} onChange={onProfilesChange} />

      <div className="label" style={{ marginTop: 12 }}>Timezone</div>
      <select className="select" value={tz} onChange={(e) => setTz(e.target.value)} style={{ maxHeight: '200px' }}>
        {timezones
          .filter((t) => t.value !== 'UTC')
          .map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
      </select>

      <div style={{ marginTop: 12 }}>
        <label className="label">Start Date &amp; Time</label>
        <div className="picker-row">
          <div className="picker-control" onClick={() => startDatePicker.current?.open?.()}>
            <span className="picker-icon">📅</span>
            <span>{start ? dayjs(start).format('MMM D, YYYY') : 'Pick a date'}</span>
            <input ref={startDateRef} type="text" className="picker-hidden" readOnly />
          </div>
          <div className="picker-control" onClick={() => startTimePicker.current?.open?.()}>
            <span className="picker-icon">🕐</span>
            <span>{startTime ? dayjs(`2000-01-01 ${startTime}`, 'YYYY-MM-DD HH:mm').format('hh:mm A') : 'Pick a time'}</span>
            <input ref={startTimeRef} type="text" className="picker-hidden" readOnly />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="label">End Date &amp; Time</label>
        <div className="picker-row">
          <div className="picker-control" onClick={() => endDatePicker.current?.open?.()}>
            <span className="picker-icon">📅</span>
            <span>{end ? dayjs(end).format('MMM D, YYYY') : 'Pick a date'}</span>
            <input ref={endDateRef} type="text" className="picker-hidden" readOnly />
          </div>
          <div className="picker-control" onClick={() => endTimePicker.current?.open?.()}>
            <span className="picker-icon">🕐</span>
            <span>{endTime ? dayjs(`2000-01-01 ${endTime}`, 'YYYY-MM-DD HH:mm').format('hh:mm A') : 'Pick a time'}</span>
            <input ref={endTimeRef} type="text" className="picker-hidden" readOnly />
          </div>
        </div>
      </div>

      <button className="btn primary" type="submit" style={{ marginTop: 16, width: '100%' }}>+ Create Event</button>
    </form>
  );
}
