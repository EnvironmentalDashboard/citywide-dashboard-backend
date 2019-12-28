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
  db.collection.find({}).sort({ layer: 1 }).toArray()
  .then(result => (
    res.json(result)
  ))
));

router.get('/:_id', (req, res) => (
  getGlyphById(req.params._id)
  .then(result => (
    res.json(result)
  ))
));

/**
 * I wonder if this is too specific to a particular implementation?
 * But, I think for now it makes sense to exist.
 *
 * Note: this function does assume any view will have gauges attached.
 * For now, this is a fair assumption to make, but it might break in the future?
 */
router.get('/:_id/gauges', (req, res) => (
  getGlyphById(req.params._id)
  .then(result => (
    res.json(result.view ? result.view.gauges : [])
  ))
));

/**
 * This also assumes that any view will have gauges attached.
 */
router.get('/:_id/gauges/:index', (req, res) => {
  const realIndex = req.params.index - 1;

  getGlyphById(req.params._id)
  .then(result => (
    res.json((result.view && realIndex > 0 && result.view.gauges.length > realIndex)
      ? result.view.gauges[realIndex] : {})
  ));
});

module.exports = router;
