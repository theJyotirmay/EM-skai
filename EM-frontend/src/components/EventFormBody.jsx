import React from 'react';
import dayjs from 'dayjs';
import { timezones } from '../lib/timezones';
import ProfileDropdown from './ProfileDropdown';
import DatePickerInput from './DatePickerInput';

export default function EventFormBody({
    profiles,
    onProfilesChange,


    selectedTimezone,
    setSelectedTimezone,
    startDate,
    setStartDate,
    startTime,
    setStartTime,
    endDate,
    setEndDate,
    endTime,
    setEndTime,
}) {
    return (
        <>
            <div style={{ marginBottom: 12 }}>
                <label className="label">Profiles</label>
                <ProfileDropdown multi selected={profiles} onChange={onProfilesChange} />
            </div>

            <div style={{ marginBottom: 12 }}>
                <label className="label" style={{ marginTop: 12 }}>Timezone</label>
                <select
                    className="select"
                    value={selectedTimezone}
                    onChange={(e) => setSelectedTimezone(e.target.value)}
                    style={{ maxHeight: '200px' }}
                >
                    {timezones
                        .filter((t) => t.value !== 'UTC')
                        .map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                </select>
            </div>

            <div style={{ marginTop: 12 }}>
                <label className="label">Start Date &amp; Time</label>
                <div className="picker-row">
                    <DatePickerInput
                        value={startDate}
                        onChange={(_, str) => setStartDate(str)}
                        options={{
                            altInput: true,
                            altFormat: 'M j, Y',
                            dateFormat: 'Y-m-d',
                            minDate: 'today'
                        }}
                        formatDisplay={(v) => dayjs(v).format('MMM D, YYYY')}
                    />
                    <DatePickerInput
                        value={startTime}
                        onChange={(_, str) => setStartTime(str)}
                        icon="🕐"
                        placeholder="Pick a time"
                        options={{
                            enableTime: true,
                            noCalendar: true,
                            dateFormat: 'H:i',
                            minuteIncrement: 15,
                            defaultDate: `2000-01-01 ${startTime}`
                        }}
                        formatDisplay={(v) => dayjs(`2000-01-01 ${v}`, 'YYYY-MM-DD HH:mm').format('hh:mm A')}
                    />
                </div>
            </div>

            <div style={{ marginTop: 12 }}>
                <label className="label">End Date &amp; Time</label>
                <div className="picker-row">
                    <DatePickerInput
                        value={endDate}
                        onChange={(_, str) => setEndDate(str)}
                        options={{
                            altInput: true,
                            altFormat: 'M j, Y',
                            dateFormat: 'Y-m-d',
                            minDate: startDate || 'today'
                        }}
                        formatDisplay={(v) => dayjs(v).format('MMM D, YYYY')}
                    />
                    <DatePickerInput
                        value={endTime}
                        onChange={(_, str) => setEndTime(str)}
                        icon="🕐"
                        placeholder="Pick a time"
                        options={{
                            enableTime: true,
                            noCalendar: true,
                            dateFormat: 'H:i',
                            minuteIncrement: 15,
                            defaultDate: `2000-01-01 ${endTime}`,
                            minTime: (startDate && endDate && startDate === endDate) ? startTime : null
                        }}
                        formatDisplay={(v) => dayjs(`2000-01-01 ${v}`, 'YYYY-MM-DD HH:mm').format('hh:mm A')}
                    />
                </div>
            </div>
        </>
    );
}
