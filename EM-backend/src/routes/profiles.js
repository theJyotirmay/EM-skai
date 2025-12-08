const express = require('express');
const Joi = require('joi');
const Profile = require('../models/Profile');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// profile creation schema
const profileSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  timezone: Joi.string().trim().required(),
});

// profile update schema - at least one field
const profileUpdateSchema = Joi.object({
  name: Joi.string().trim().min(1),
  timezone: Joi.string().trim(),
}).min(1);

// POST - create a new profile
router.post('/', asyncHandler(async (req, res) => {
  const { error, value } = profileSchema.validate(req.body);
  if (error) {
    error.status = 400;
    throw error;
  }
  
  // check if profile name is already taken
  const existing = await Profile.findOne({ name: value.name });
  if (existing) {
    const err = new Error('Profile name already exists');
    err.status = 409;
    throw err;
  }
  
  const profile = await Profile.create(value);
  res.status(201).json(profile);
}));

// GET - fetch all profiles
router.get('/', asyncHandler(async (_req, res) => {
  const profiles = await Profile.find().sort({ createdAt: -1 });  // newest profiles first
  res.json(profiles);
}));

// PATCH - update a profile
router.patch('/:id', asyncHandler(async (req, res) => {
  const { error, value } = profileUpdateSchema.validate(req.body);
  if (error) {
    error.status = 400;
    throw error;
  }

  const profile = await Profile.findById(req.params.id);
  if (!profile) {
    const err = new Error('Profile not found');
    err.status = 404;
    throw err;
  }

  // if changing name, make sure it's not already taken
  if (value.name && value.name !== profile.name) {
    const existing = await Profile.findOne({ name: value.name });
    if (existing) {
      const err = new Error('Profile name already exists');
      err.status = 409;
      throw err;
    }
  }

  Object.assign(profile, value);
  await profile.save();
  res.json(profile);
}));

module.exports = router;
