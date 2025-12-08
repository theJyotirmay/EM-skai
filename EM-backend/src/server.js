require('dotenv').config();
const app = require('./app');
const connectDb = require('./config/db');

const PORT = process.env.PORT || 4000;  // default to 4000 if env var not set

// startup - gotta connect to DB first, then start listening
(async () => {
  try {
    await connectDb();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
