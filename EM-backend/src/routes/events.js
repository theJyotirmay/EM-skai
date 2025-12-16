const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const eventController = require('../controllers/eventController');

const router = express.Router();

// POST - create new event
router.post('/', asyncHandler(eventController.createEvent));

// GET - retrieve all events with optional profile filter
router.get('/', asyncHandler(eventController.getEvents));

// GET - fetch one event by ID
router.get('/:id', asyncHandler(eventController.getEventById));

// PATCH - update existing event
router.patch('/:id', asyncHandler(eventController.updateEvent));

// GET - fetch the audit trail for an event
router.get('/:id/logs', asyncHandler(eventController.getEventLogs));

module.exports = router;
