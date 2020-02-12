#! /usr/bin/env node

const yargs = require('yargs');

const db = require('./db');

const argv = yargs.option('url',
  {
    description: 'the URL of the database',
    alias: 'u',
    type: 'string'
  }).argv;

const url = argv.url || 'mongodb://localhost:52000/cleveland-cwd';

db.connect(url).then((collection) => {
  console.log(collection);
});
