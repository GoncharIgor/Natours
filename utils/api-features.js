class APIFeatures {
  // query - mongoose Query; queryString = req.query
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1 way
    /*   const tours = await Tour.find({
          duration: 5,
          difficulty: 'easy',
        });*/

    // 2 way
    /*const query = Tour.find()
          .where('duration')
          .equals(5)
          .where('difficulty')
          .equals('easy');*/

    const queryObj = { ...this.queryString };
    const fieldsToExclude = ['page', 'sort', 'limit', 'fields'];
    fieldsToExclude.forEach((el) => delete queryObj[el]);

    // Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (matchedWord) => `$${matchedWord}`
    );

    this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    // if query Obj has 'sort' property
    // string in browser: 127.0.0.1:3000/api/v1/tours?sort=-price,ratingsAverage (sort price Desc and by second parameter, as addition)
    // but sort query in mongoose is with space: sort(price ratingsAverage). Thus - we split with space
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const sortBy = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(sortBy);
    } else {
      this.query = this.query.select('-__v'); // exclude '__v' field
    }

    return this;
  }

  paginate() {
    // page=2&limit=10. Skip - number of ITEMS to skip, not pages
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
