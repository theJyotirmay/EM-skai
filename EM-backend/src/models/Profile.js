const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    timezone: { type: String, required: true, default: 'UTC' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
