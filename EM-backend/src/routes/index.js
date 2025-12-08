const express = require('express');
const profileRoutes = require('./profiles');
const eventRoutes = require('./events');

const router = express.Router();

router.use('/profiles', profileRoutes);
router.use('/events', eventRoutes);

module.exports = router;
