import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);


export function fmt(date, tz) {
  if (!date) return '-';
  const d = tz ? dayjs(date).tz(tz) : dayjs(date);
  return d.format('MMM D, YYYY');
}


export function fmtTime(date, tz) {
  if (!date) return '-';
  const d = tz ? dayjs(date).tz(tz) : dayjs(date);
  return d.format('hh:mm A');
}


export function isoLocal(date) {
  return date ? dayjs(date).format('YYYY-MM-DDTHH:mm') : '';
}


export function nowIso() {
  return dayjs().format('YYYY-MM-DDTHH:mm');
}
