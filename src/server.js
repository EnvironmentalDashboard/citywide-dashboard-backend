const express = require('express');
const server = express();
const bodyParser = require('body-parser');

const PORT = 80;
const PATH = process.env.PATH_PREFIX ? `/${process.env.PATH_PREFIX}` : '';

const DEVELOPMENT = 0;
const ENVIRONMENT = DEVELOPMENT;

const glyphs = require('./glyphs');
const views = require('./views');

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

const routers = {
  '/glyphs': glyphs,
  '/views': views
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
  server.use(`${PATH}${k}`, routers[k]);
});

server.get(`${PATH}/check`, (req, res) => res.sendStatus(200));

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
