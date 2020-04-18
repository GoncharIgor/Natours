const fs = require('fs');
const http = require('http');
const url = require('url');
const slugify = require('slugify');
const replaceTemplate = require('./modules/templates');

const templateOverview = fs.readFileSync(
  `${__dirname}/templates/overview.html`,
  'utf-8'
);
const templateCard = fs.readFileSync(
  `${__dirname}/templates/card.html`,
  'utf-8'
);
const templateProduct = fs.readFileSync(
  `${__dirname}/templates/product.html`,
  'utf-8'
);

const products = fs.readFileSync(`${__dirname}/data/products.json`, 'utf-8');
const productsObject = JSON.parse(products);

const slugs = productsObject.map((el) => {
  return slugify(el.productName, { lower: true });
});

const server = http.createServer((req, res) => {
  // this CB f() will be called every time any request reaches the server
  // server automatically makes 2 requests: 1 for uri, another - for favicon

  // console.log(req.headers['user-agent']);

  const { query, pathname } = url.parse(req.url, true); // true - to parse query string (?id=1)

  // overview page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, {
      'Content-type': 'text/html',
    });
    const cardsHtml = productsObject
      .map((card) => replaceTemplate(templateCard, card))
      .join('');
    const output = templateOverview.replace(' {%PRODUCT_CARDS%}', cardsHtml);

    res.end(output);

    // product page
  } else if (pathname === '/product') {
    res.writeHead(200, {
      'Content-type': 'text/html',
    });

    const product = productsObject[query.id];
    const output = replaceTemplate(templateProduct, product);
    res.end(output);

    // api page
  } else if (pathname === '/api') {
    res.writeHead(200, {
      'Content-type': 'application/json',
    });
    res.end(products);

    //not found
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
