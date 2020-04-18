const fs = require('fs');
const server = require('http').createServer();

server.on('request', (req, res) => {
  //solution 1 - will give the whole result at once
  fs.readFile('test-file.txt', (err, data) => {
    if (err) {
      console.log(err);
    }
    res.end(data);
  });

  //solution 2 - Streaming - will give data one by one piece
  // but this approach has backpressure problem - reading stream is faster then writing one
  const readable = fs.createReadStream('test-file.txt');
  readable.on('data', (pieceOfData) => {
    res.write(pieceOfData);
  });

  readable.on('end', () => {
    res.end();
  });

  readable.on('error', (error) => {
    console.log(error);
    res.statusCode = 500;
    res.end('File not found');
  });

  //solution 3 - Streaming without backpressure problem
  const readable3 = fs.createReadStream('test-file.txt');
  readable3.pipe(res); //readableSource.pipe(writeableDestination)
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to port 8000...');
});
