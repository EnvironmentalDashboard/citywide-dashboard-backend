const express = require('express');
const router = express.Router();

const ObjectId = require('mongodb').ObjectId;

const db = require('./db');

const getGlyphById = id => (
  db.collection.findOne({
    _id: id
  }).then(result => (
    // This ternary situation should not have to happen in an ideal world.
    result ? result : db.collection.findOne({
      _id: new ObjectId(id)
    }).then(oresult => (
      oresult
    ))
  ))
);

router.get('/', (req, res) => (
  db.collection.find({}).sort({ layer: 1 }).toArray().then(result => (
    res.json(result)
  ))
));

router.get('/:_id', (req, res) => (
  getGlyphById(req.params._id)
  .then(result => (
    res.json(result)
  ))
));

module.exports = router;
