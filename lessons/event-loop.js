const fs = require('fs');
const crypto = require('crypto');

const start = Date.now();
process.env.UV_THREADPOOL_SIZE = 1; // changes the default 4 threads to 1. Cryptography will be executed 1 by 1 in 1 thread

setImmediate(() => console.log('Immediate 1 finished'));
setTimeout(() => console.log('Timer 1 finished'), 0);
setImmediate(() => console.log('Immediate 2 finished'));

fs.readFile('test-file.txt', 'utf-8', () => {
  console.log('I/O finished');
  console.log('------Uppers one are not in the event loop------');

  setTimeout(() => console.log('Timer 2 finished'), 0);
  setTimeout(() => console.log('Timer 3 finished'), 3000);
  setImmediate(() => console.log('Immediate 3 finished'));

  process.nextTick(() => console.log('Process.nextTick'));

  crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
    console.log('Password was encrypted in ms: ', Date.now() - start);
  });
  crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
    console.log('Password was encrypted in ms: ', Date.now() - start);
  });
  crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
    console.log('Password was encrypted in ms: ', Date.now() - start);
  });
  crypto.pbkdf2('password', 'salt', 100000, 1024, 'sha512', () => {
    console.log('Password was encrypted in ms: ', Date.now() - start);
  });
});

console.log('Hello from top level code');

// Hello from top level code
// Timer 1 finished
// Immediate 1 finished
// Immediate 2 finished
// I/O finished
// ------Uppers one are not in the event loop------
// Process.nextTick
// Immediate 3 finished
// Timer 2 finished
// Password was encrypted in ms:  1041
// Password was encrypted in ms:  1996
// Password was encrypted in ms:  2946
// Timer 3 finished
// Password was encrypted in ms:  3920
