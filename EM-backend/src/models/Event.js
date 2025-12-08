const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    timezone: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    profiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true }],
    logs: [
      {
        timestamp: { type: Date, required: true },
        changes: { type: Object, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
