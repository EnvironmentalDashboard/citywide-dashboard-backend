const express = require('express');
const router = express.Router();

const db = require('./db');

const getViews => (
  db.collection.find({
    view: {$exists: true}
  })
);

router.get('/', (req, res) => (
  getViews()
  .then(result => (
    res.json(result)
  ))
));

module.exports = router;
