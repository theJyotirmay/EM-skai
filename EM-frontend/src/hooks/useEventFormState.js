import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export function useEventFormState(initialData = null) {
    const [selectedTimezone, setSelectedTimezone] = useState(initialData?.timezone || 'America/New_York');
    const [startDate, setStartDate] = useState(initialData?.start ? dayjs(initialData.start).tz(initialData.timezone).format('YYYY-MM-DD') : '');
    const [startTime, setStartTime] = useState(initialData?.start ? dayjs(initialData.start).tz(initialData.timezone).format('HH:mm') : '09:00');
    const [endDate, setEndDate] = useState(initialData?.end ? dayjs(initialData.end).tz(initialData.timezone).format('YYYY-MM-DD') : '');
    const [endTime, setEndTime] = useState(initialData?.end ? dayjs(initialData.end).tz(initialData.timezone).format('HH:mm') : '09:00');


    useEffect(() => {
        if (initialData) {
            setSelectedTimezone(initialData.timezone);
            const startDt = dayjs(initialData.start).tz(initialData.timezone);
            const endDt = dayjs(initialData.end).tz(initialData.timezone);
            setStartDate(startDt.format('YYYY-MM-DD'));
            setStartTime(startDt.format('HH:mm'));
            setEndDate(endDt.format('YYYY-MM-DD'));
            setEndTime(endDt.format('HH:mm'));
        }
    }, [initialData]);

    const enforceEndTime = useCallback((nextEndTime) => {
        if (startDate && endDate && startDate === endDate) {
            const startMoment = dayjs(`2000-01-01 ${startTime}`, 'YYYY-MM-DD HH:mm');
            const endMoment = dayjs(`2000-01-01 ${nextEndTime}`, 'YYYY-MM-DD HH:mm');
            if (endMoment.isBefore(startMoment)) {
                setEndTime(startTime);
                return;
            }
        }
        setEndTime(nextEndTime);
    }, [startDate, endDate, startTime]);

    const handleStartDateChange = (dateStr) => {
        setStartDate(dateStr);
        if (endDate && dateStr && dayjs(dateStr).isAfter(dayjs(endDate))) {
            setEndDate('');
        }
    };

    const handleStartTimeChange = (timeStr) => {
        setStartTime(timeStr);
        if (endDate && startDate === endDate) {
            const startMoment = dayjs(`2000-01-01 ${timeStr}`, 'YYYY-MM-DD HH:mm');
            const endMoment = dayjs(`2000-01-01 ${endTime}`, 'YYYY-MM-DD HH:mm');
            if (endMoment.isBefore(startMoment)) {
                setEndTime(timeStr);
            }
        }
    };

    const resetForm = () => {
        setStartDate('');
        setEndDate('');
        setStartTime('09:00');
        setEndTime('09:00');
    };

    const getISOValues = () => {
        const startDateTime = dayjs.tz(`${startDate} ${startTime}`, 'YYYY-MM-DD HH:mm', selectedTimezone).toISOString();
        const endDateTime = dayjs.tz(`${endDate} ${endTime}`, 'YYYY-MM-DD HH:mm', selectedTimezone).toISOString();
        return { start: startDateTime, end: endDateTime };
    };

    const isValid = () => {
        if (!startDate || !endDate) return false;
        const { start, end } = getISOValues();
        return !dayjs(end).isBefore(dayjs(start));
    };

    return {
        selectedTimezone, setSelectedTimezone,
        startDate, setStartDate: handleStartDateChange,
        startTime, setStartTime: handleStartTimeChange,
        endDate, setEndDate,
        endTime, setEndTime: enforceEndTime,
        resetForm,
        getISOValues,
        isValid
    };
}
