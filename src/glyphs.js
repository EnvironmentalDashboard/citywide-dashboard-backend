const express = require('express');
const router = express.Router();

const ObjectId = require('mongodb').ObjectId;

const db = require('./db');

const sha256 = require('js-sha256');

const getGlyphById = id => (
  db.collection.findOne({
    _id: new ObjectId(id)
  }).then(oresult => (oresult))
);

const getGlyphGaugesById = id => (
  getGlyphById(id)
  .then(result => (
    result.view ? result.view.gauges : []
  ))
);

const getGlyphMessagesById = id => (
  getGlyphById(id)
  .then(result => (
    result.view ? result.view.messages : []
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
);

// The two possible errors are no data present or malformed JSON.
const processCacheRequest = req => {
  const processed = {
    errors: [],
    parsed: {}
  };

  if (!req.body.data) {
    processed.errors.push('No data provided!');
  }

  try {
    processed.parsed = JSON.parse(req.body.data);
  } catch (e) {
    if (e instanceof SyntaxError) {
      processed.errors.push('Invalid JSON body!');
    }
  }

  return processed;
};

const processMessageRequest = req => {
  const processed = {
    errors: [],
    parsed: {}
  };

  if (!req.body.message || req.body.probability === undefined) {
    processed.errors.push('No data provided!');
  }

  try {
    processed.parsed.message = req.body.message;
    processed.parsed.probability = req.body.probability;
  } catch (e) {
    if (e instanceof SyntaxError) {
      processed.errors.push('Invalid JSON body!');
    }
  }

  if (!req.body.pass || sha256(req.body.pass + "719GxFYNgo") !== "700e78f75bf9abb38e9b2f61b227afe94c204947eb0227174c48f55a4dcc8139") {
    processed.errors.push('Invalid password.')
  }

  return processed;
};

const updateMessages = (id, path, req) => {
  return db.collection.updateOne(
    {
      _id: new ObjectId(id)
    },
    {
      $set: {
        [`${path}.text`]: req.parsed.message,
        [`${path}.probability`]: req.parsed.probability
      }
    }
  )
};

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

router.get('/:_id/messages', (req, res) => (
  getGlyphMessagesById(req.params._id)
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
  const processed = processCacheRequest(req);

  if (processed.errors.length > 0) {
    res.json({
      'errors': processed.errors
    });
  } else {
    db.collection.updateOne(
      { _id: req.params._id },
      {
        $set: {
          data: processed.parsed
        }
      }
    )
    .then(result => res.json(result));
  }
});

router.post('/:_id/gauges/:index/cache', (req, res) => {
  const processed = processCacheRequest(req);

  if (processed.errors.length > 0) {
    res.json({
      'errors': processed.errors
    });
  } else {
    db.collection.updateOne(
      {
        _id: req.params._id,
        [`view.gauges.${req.params.index - 1}`]: { $exists: true }
      },
      {
        $set: {
          [`view.gauges.${req.params.index - 1}.data`]: processed.parsed
        }
      }
    )
    .then(result => res.json(result));
  }
});

//Used to update a message attached to a gauge
router.post('/:_id/gauges/:index/messages/:num', (req, res) => {
  const processed = processMessageRequest(req);

  if (processed.errors.length > 0) {
    res.json({
      'errors': processed.errors
    });
  } else {
    updateMessages(req.params._id,
    `view.gauges.${req.params.index - 1}.messages.${req.params.num - 1}`, processed).then(result => res.json(result));
  }
});

router.post('/:_id/gauges/:index/messages', (req, res) => {
  const processed = processMessageRequest(req);

  if (processed.errors.length > 0) {
    res.json({
      'errors': processed.errors
    });
  } else {
    db.collection.updateOne(
      {
        _id: new ObjectId(req.params._id)
      },
      {
        $push: {
          [`view.gauges.${req.params.index - 1}.messages`]: processed.parsed
        }
      }
    )
    .then(result => res.json(result));
  }
});

router.post('/:_id/messages', (req, res) => {
  const processed = processMessageRequest(req);

  if (processed.errors.length > 0) {
    res.json({
      'errors': processed.errors
    });
  } else {
    db.collection.updateOne(
      {
        _id: new ObjectId(req.params._id)
      },
      {
        $push: {
          [`view.messages`]: processed.parsed
        }
      }
    )
    .then(result => res.json(result));
  }
});


//Used to update a message attached to a view
router.post('/:_id/messages/:num', (req, res) => {
  const processed = processMessageRequest(req);

  if (processed.errors.length > 0) {
    res.json({
      'errors': processed.errors
    });
  } else {
    updateMessages(req.params._id, `view.messages.${req.params.num - 1}`, processed).then(result => res.json(result));
  }
});

module.exports = router;
