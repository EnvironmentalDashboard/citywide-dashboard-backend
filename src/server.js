const express = require('express');
const server = express();
const bodyParser = require('body-parser');
const PORT = 80;

const DEVELOPMENT = 0;
const ENVIRONMENT = DEVELOPMENT;

const glyphs = require('./glyphs');

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

const routers = {
  '/glyphs': glyphs
};

if (ENVIRONMENT === DEVELOPMENT) {
  server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
  });
}

Object.keys(routers).forEach(k => {
  server.use(k, routers[k]);
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
