const fs = require('fs');
const http = require('http');
const path = require('path');
const mime = require('mime-types');

const CONTENT_TYPE_KEY = 'Content-Type';

const server = http.createServer((req, res) => {
  const url =
    req.url === '/'
      ? './index.html'
      : req.url.startsWith('/dist/')
      ? `..${req.url}`
      : `.${req.url}`;
  const absUrl = path.join(__dirname, url);
  console.log('url:', req.url);
  console.log('absUrl:', absUrl);
  if (!fs.existsSync(absUrl)) {
    res.writeHead(404, {
      [CONTENT_TYPE_KEY]: 'text/plain'
    });
    res.write('Error 404: resource not found.');
  } else {
    res.writeHead(200, {
      [CONTENT_TYPE_KEY]: mime.lookup(absUrl)
    });
    const fileContent = fs.readFileSync(absUrl);
    res.write(fileContent);
  }
  res.end();
});

server.listen(2333, function () {
  console.log('fps-watcher demo listen to 2333');
});
