const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tour.model');
const User = require('../../models/user.model');
const Review = require('../../models/review.model');

dotenv.config({ path: '../../config.env' });

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful'));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

const importData = async () => {
  try {
    await Tour.create(tours);
    // to remove from user model password encryption, because it's already encrypted in test data
    // password to all users: "test1234"
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data successfully loaded');
  } catch (e) {
    console.log(e);
  } finally {
    process.exit();
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data successfully deleted');
  } catch (e) {
    console.log(e);
  } finally {
    process.exit();
  }
};

if (process.argv[2] === '--import') {
  (async () => {
    await importData();
  })();
} else if (process.argv[2] === '--delete') {
  (async () => {
    await deleteData();
  })();
}
