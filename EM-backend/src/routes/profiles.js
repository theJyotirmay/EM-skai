const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const profileController = require('../controllers/profileController');

const router = express.Router();

// POST - create a new profile
router.post('/', asyncHandler(profileController.createProfile));

// GET - fetch all profiles
router.get('/', asyncHandler(profileController.getProfiles));

// PATCH - update a profile
router.patch('/:id', asyncHandler(profileController.updateProfile));

module.exports = router;
