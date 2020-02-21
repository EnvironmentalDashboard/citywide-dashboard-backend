#! /usr/bin/env node

const yargs = require('yargs');

const db = require('./db');

const argv = yargs.options({
  'url': {
    describe: 'the URL of the database',
    alias: 'u',
    type: 'string'
  },
  'script': {
    describe: 'the script to run',
    alias: 's',
    type: 'script'
  }
}).argv;

const url = argv.url || 'mongodb://localhost:52000/cleveland-cwd';
const script = argv.script;

if (!script) {
  console.error('Must specify a script to run. Exiting');
  process.exit(1);
}

const program = require(`./scripts/${script}.js`);

db.connect(url).then((collection) => {
  program.canRun(collection).then(answer => {
    if (answer) {
      program.run(collection);
    } else {
      console.log('The system is already set up to handle this update.');
    }
  });
});
