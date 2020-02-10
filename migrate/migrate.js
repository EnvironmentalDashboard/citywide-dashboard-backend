#! /usr/bin/env node

const db = require('./db');

db.connect('mongodb://localhost:52000/cleveland-cwd').then((collection) => {
  console.log(collection);
});
