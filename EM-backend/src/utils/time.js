const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

function toTzISOString(date, tz) {
  return dayjs(date).tz(tz).toISOString();
}

function mapEventToTimezone(eventDoc, tz) {
  const e = eventDoc.toObject ? eventDoc.toObject() : eventDoc;
  return {
    ...e,
    start: toTzISOString(e.start, tz),
    end: toTzISOString(e.end, tz),
    createdAt: toTzISOString(e.createdAt, tz),
    updatedAt: toTzISOString(e.updatedAt, tz),
    logs: (e.logs || []).map((log) => ({
      ...log,
      timestamp: toTzISOString(log.timestamp, tz),
    })),
  };
}

module.exports = {
  toTzISOString,
  mapEventToTimezone,
};
