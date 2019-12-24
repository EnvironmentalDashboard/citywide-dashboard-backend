const express = require('express');
const router = express.Router();

const ObjectId = require('mongodb').ObjectId;

const db = require('./db');

router.get('/', (req, res) => (
  db.collection.find({}).sort({ layer: 1 }).toArray().then(result => (
    res.json(result)
  ))
));

router.get('/:_id', (req, res) => {
  db.collection.findOne({
    _id: req.params._id
  }).then(result => (
    // This ternary situation should not have to happen in an ideal world.
    result ? res.json(result) : db.collection.findOne({
      _id: new ObjectId(req.params._id)
    }).then(oresult => (
      res.json(oresult)
    ))
  ))
});

module.exports = router;
