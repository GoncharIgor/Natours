const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('🤬 UNCAUGHT EXCEPTION');
  console.log(err);
  // console.log(`${err.name}: ${err.message}`);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful'))
  .catch((err) => console.log('Failed to connect to DB'));

const app = require('./app');

// process.env.PORT: absolutely mandatory to indicate port through env variable for Heroku
const port = process.env.PORT || 3000;

const server = app.listen(process.env.PORT, () => {
  console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('🤬 UNHANDLED REJECTION');
  console.log(`${err.name}: ${err.message}`);

  server.close(() => {
    process.exit(1);
  });
});

// heroku Dyno restart
process.on('SIGTERM', (err) => {
  console.log('🤬 SIGTERM received. Shutting down gracefully');

  server.close(() => {
    // not calling  process.exit(1);, because heroku SIGTERM will make it by itself
    // but all pending requests still be processed before close
    console.log('Process terminated');
  });
});
