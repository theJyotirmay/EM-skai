import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// format date to readable string like "Dec 19, 2025"
export function fmt(date, tz) {
  if (!date) return '-';
  const d = tz ? dayjs(date).tz(tz) : dayjs(date);
  return d.format('MMM D, YYYY');
}

// format time to readable string like "02:45 PM"
export function fmtTime(date, tz) {
  if (!date) return '-';
  const d = tz ? dayjs(date).tz(tz) : dayjs(date);
  return d.format('hh:mm A');
}

// convert to ISO string for HTML input
export function isoLocal(date) {
  return date ? dayjs(date).format('YYYY-MM-DDTHH:mm') : '';
}

// get current time as ISO string
export function nowIso() {
  return dayjs().format('YYYY-MM-DDTHH:mm');
}
