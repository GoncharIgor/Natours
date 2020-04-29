const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./user.model');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'Tour name has to be max of 40 characters'],
      minlength: [5, 'Tour name has to be min of 5 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a group difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty has to be easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // works only for creating new documents, not for updating document
          //  return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below the regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // to hide field from response
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    startDates: [Date],
    // Nested Embedded Object
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array, // for Embedding
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    // If you use toJSON() or toObject() mongoose will not include virtuals by default. This includes the output of calling JSON.stringify() on a Mongoose document
    // To show virtual property in response - Pass { virtuals: true } to either toObject() or toJSON().
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// tourSchema.index({ price: 1 }); // 1 - index in asc order; -1 = in desc order
// better to make indexes for mostly reading fields. If document often wrtitten - then NO. Cos index also takes space in DB
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

// virtual properties are not stored in DB
// virtual properties can't be used in queries
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// mongoose middleware to run before .save() and .create() commands, but NOT .insertManny(), or .find()
// can have multiple same hooks
tourSchema.pre('save', function (next) {
  //this - is a Document that will be saved to DB
  // create a new property 'slug' in Document
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Embedding of users in Tours
// takes user id from req.body.guides array and makes User objects from it
/*tourSchema.pre('save', async function (next) {
  const guidesPromises = this.guides.map(async (id) => await User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
});*/

tourSchema.post('save', function (doc, next) {
  next();
});

// hook before execution .find() query method
// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
  // all f() that start with 'find'
  // 'this' keyword point to the current query, but not to the Document
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    // populate = full User Obj instead of just its ID will be stored to 'guides' model.property
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query time execution: ${Date.now() - this.start} ms`);
  next();
});

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

const testTour = new Tour({
  name: 'Park Camper',
  rating: 4.8,
  price: 590,
});

/*testTour
  .save()
  .then((document) => {
    console.log(document);
  })
  .catch((error) => {
    console.log(error);
  });*/
