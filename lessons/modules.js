console.log(arguments);
console.log(require('module').wrapper);

// require() exports object: exports. It's a part of bigger object - module: module.exports
// if we have 1 item to export - we use module.exports = {...}
// if we have 2 or more items to export - we use exports.param = {...}

// calculator.js
exports.add = (a, b) => a + b;
exports.multiply = (a, b) => a * b;

const calculator = require('calculator.js');

calculator.add(2, 5);

// or we may use destructuring:
const { add, multiply } = require('calculator.js');

add(2, 7);

// CACHING
// in exporting.js
console.log('Module higher order text');
module.exports = () => console.log('Function call text');

require('exporting.js')();
require('exporting.js')();
require('exporting.js')();

// Module higher order text
// Function call text
// Function call text
// Function call text
