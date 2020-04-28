const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tour.model');

dotenv.config({ path: '../../config.env' });

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful'));

const toursRaw = fs.readFileSync(`${__dirname}/tours.json`, 'utf-8');
const tours = JSON.parse(toursRaw);

const importData = async () => {
  try {
    await Tour.create(tours);
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
