const Joi = require('joi');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const Event = require('../models/Event');
const Profile = require('../models/Profile');
const { mapEventToTimezone } = require('../utils/time');

// dayjs plugins - needed for timezone handling
dayjs.extend(utc);
dayjs.extend(timezone);

// schema for creating a new event - validates everything
const eventSchema = Joi.object({
    timezone: Joi.string().trim().required(),
    start: Joi.date().required(),
    end: Joi.date().min(Joi.ref('start')).required(),  // end date validation
    profiles: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
});

// update schema - all fields optional
const eventUpdateSchema = eventSchema.fork(['timezone', 'start', 'end', 'profiles'], (schema) =>
    schema.optional()
);

const createEvent = async (req, res) => {
    const { error, value } = eventSchema.validate(req.body);
    if (error) {
        error.status = 400;
        throw error;
    }

    // prevent duplicate profile IDs - user might accidentally send the same ID twice
    const uniqueProfiles = [...new Set(value.profiles)];
    const profiles = await Profile.find({ _id: { $in: uniqueProfiles } });

    // verify each profile actually exists in DB
    if (profiles.length !== uniqueProfiles.length) {
        const err = new Error('One or more profiles not found');
        err.status = 404;
        throw err;
    }

    const event = await Event.create({
        ...value,
        profiles: uniqueProfiles,
        logs: []  // start with empty logs
    });
    res.status(201).json(event);
};

const getEvents = async (req, res) => {
    const { profileId, timezone: tz } = req.query;
    const filter = {};

    // if user specified a profile, filter by it
    if (profileId) {
        filter.profiles = profileId;
    }

    const events = await Event.find(filter)
        .populate('profiles')
        .sort({ start: 1 });  // chronological order

    // apply timezone conversion if requested
    if (tz) {
        return res.json(events.map((e) => mapEventToTimezone(e, tz)));
    }
    res.json(events);
};

const getEventById = async (req, res) => {
    const { timezone: tz } = req.query;
    const event = await Event.findById(req.params.id).populate('profiles');

    if (!event) {
        const err = new Error('Event not found');
        err.status = 404;
        throw err;
    }

    // convert to the requested timezone for display
    if (tz) {
        return res.json(mapEventToTimezone(event, tz));
    }
    res.json(event);
};

const updateEvent = async (req, res) => {
    const { error, value } = eventUpdateSchema.validate(req.body);
    if (error) {
        error.status = 400;
        throw error;
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
        const err = new Error('Event not found');
        err.status = 404;
        throw err;
    }

    // track all the changes - important for audit trail
    const changes = {};
    ['timezone', 'start', 'end', 'profiles'].forEach((key) => {
        if (value[key] !== undefined && value[key] !== null) {
            let hasChanged = false;
            const oldValue = event[key];
            let newValue = key === 'profiles' ? [...new Set(value[key])] : value[key];

            // smart comparison based on type
            if (key === 'profiles') {
                const oldIds = (oldValue || []).map(id => id.toString()).sort();
                const newIds = [...(newValue || [])].sort();
                if (JSON.stringify(oldIds) !== JSON.stringify(newIds)) {
                    hasChanged = true;
                }
            } else if (key === 'start' || key === 'end') {
                const t1 = new Date(oldValue).getTime();
                const t2 = new Date(newValue).getTime();
                // ignore differences smaller than 1000ms (1 second) to handle rounding issues
                if (Math.abs(t1 - t2) > 1000) {
                    hasChanged = true;
                }
            } else {
                // loose equality for other fields (handle string/number differences)
                if (String(oldValue) !== String(newValue)) {
                    hasChanged = true;
                }
            }

            if (hasChanged) {
                changes[key] = { from: oldValue, to: newValue };
                event[key] = newValue;
            }
        }
    });

    // validate that dates make sense
    if (event.end < event.start) {
        const err = new Error('End date cannot be before start date');
        err.status = 400;
        throw err;
    }

    // if profiles changed, verify they all exist
    if (changes.profiles) {
        const profiles = await Profile.find({ _id: { $in: event.profiles } });
        if (profiles.length !== event.profiles.length) {
            const err = new Error('One or more profiles not found');
            err.status = 404;
            throw err;
        }
    }

    // only add log if something actually changed
    if (Object.keys(changes).length > 0) {
        event.logs.push({
            timestamp: new Date(),
            changes
        });
    }

    await event.save();
    res.json(event);
};

const getEventLogs = async (req, res) => {
    const { timezone: tz } = req.query;
    const event = await Event.findById(req.params.id);

    if (!event) {
        const err = new Error('Event not found');
        err.status = 404;
        throw err;
    }

    let logs = event.logs;
    // convert each log timestamp to the requested timezone
    if (tz) {
        logs = logs.map((log) => {
            const raw = log.toObject ? log.toObject() : log;
            return {
                ...raw,
                timestamp: dayjs(raw.timestamp).tz(tz).toISOString()
            };
        });
    }
    res.json(logs);
};

module.exports = {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    getEventLogs,
};
