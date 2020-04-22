module.exports = (fn) => {
  // returns new async f() that can be assigned later to createTour() f()
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
