const fs = require('fs');
const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  // this CB f() will be called every time any request reaches the server
  // server automatically makes 2 requests: 1 for uri, another - for favicon

  const pathName = req.url;
  console.log(req.headers['user-agent']);

  if (pathName === '/' || pathName === '/overview') {
    res.end('This is the OVERVIEW');
  } else if (pathName === '/product') {
    res.end('This is the PRODUCT');
  } else {
    res.writeHead(404, {
      'Content-type': 'text/html', // now response text below will be parsed as html
      'my-own-header': 'hello-world',
    });
    res.end('<h1>Page not found</h1>');
  }
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Server has started and listening to port 8000');
});
