const Joi = require('joi');
const Profile = require('../models/Profile');

//schema to create profiles
const profileSchema = Joi.object({
    name: Joi.string().trim().min(1).required(),
    timezone: Joi.string().trim().required(),
});

//schema to update profiles (at least one field)
const profileUpdateSchema = Joi.object({
    name: Joi.string().trim().min(1),
    timezone: Joi.string().trim(),
}).min(1);

const createProfile = async (req, res) => {
    const { error, value } = profileSchema.validate(req.body);
    if (error) {
        error.status = 400;
        throw error;
    }

    //check if profile name is taken
    const existing = await Profile.findOne({ name: value.name });
    if (existing) {
        const err = new Error('Profile name already exists');
        err.status = 409;
        throw err;
    }

    const profile = await Profile.create(value);
    res.status(201).json(profile);
};

const getProfiles = async (_req, res) => {
    const profiles = await Profile.find().sort({ createdAt: -1 });  //newest profiles first
    res.json(profiles);
};

const updateProfile = async (req, res) => {
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

    //if changing name, make sure it's not taken
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
};

module.exports = {
    createProfile,
    getProfiles,
    updateProfile,
};
