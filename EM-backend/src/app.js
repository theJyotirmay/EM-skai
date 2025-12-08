const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// enable CORS - opening it up for all origins in dev
// TODO: restrict this to frontend domain in production
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));  // nice dev logging for debugging

// register all API routes under /api
app.use('/api', routes);

// health check - useful for monitoring
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// error handling - needs to be last
app.use(errorHandler);

module.exports = app;
