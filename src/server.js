const express = require('express');
const server = express();
const PORT = 3006;

const DEVELOPMENT = 0;
const ENVIRONMENT = DEVELOPMENT;

const glyphs = require('./glyphs');

const routers = {
  '/glyphs': glyphs
};

if (ENVIRONMENT === DEVELOPMENT) {
  server.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  });
}

Object.keys(routers).forEach(k => {
  server.use(k, routers[k]);
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
