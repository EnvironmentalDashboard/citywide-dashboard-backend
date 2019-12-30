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

const getGlyphGaugesById = id => (
  getGlyphById(id)
  .then(result => (
    result.view ? result.view.gauges : []
  ))
);

/**
 * Gets a glyph gauge by both a glyph ID and a gauge index.
 */
const getGlyphGauge = (id, index) => (
  getGlyphGaugesById(id)
  .then(result => (
    (index >= 0 && result.length > index) ? result[index] : {}
  ))
)

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
  getGlyphGaugesById(req.params._id)
  .then(result => (
    res.json(result)
  ))
));

/**
 * This also assumes that any view will have gauges attached.
 */
router.get('/:_id/gauges/:index', (req, res) => {
  const realIndex = req.params.index - 1;

  getGlyphGauge(req.params._id, realIndex)
  .then(result => (
    res.json(result)
  ));
});

router.post('/:_id/cache', (req, res) => {
  let errors = [];
  let parsed = {};

  if (!req.body.data) {
    errors.push('No data provided!');

    res.json({
      'errors': errors
    });

    return;
  }

  try {
    parsed = JSON.parse(req.body.data);
  } catch (e) {
    if (e instanceof SyntaxError) {
      errors.push('Invalid JSON body!');

      res.json({
        'errors': errors
      });

      return;
    }
  }

  db.collection.updateOne(
    { _id: req.params._id },
    {
      $set: {
        data: JSON.parse(req.body.data)
      }
    }
  )
  .then(result => res.json(result));
});

module.exports = router;
