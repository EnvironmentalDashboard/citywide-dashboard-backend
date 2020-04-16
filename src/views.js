const express = require('express');
const router = express.Router();

const db = require('./db');

router.get('/', (req, res) => (
  db.collection.find({
    view: {$exists: true}
  })
  .then(result => (
    res.json(result)
  ))
));

module.exports = router;
