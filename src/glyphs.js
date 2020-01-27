const express = require('express');
const router = express.Router();

const db = require('../common/db');

router.get('/', (req, res) => {
  return db.collection.find({}).sort({ layer: 1 }).toArray().then(result => (
    res.json(result)
  ))
});

module.exports = router;
