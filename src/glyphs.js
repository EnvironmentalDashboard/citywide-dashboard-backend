const express = require('express');
const formidable = require('express-formidable');
const lineReader = require('line-reader');

const router = express.Router();

const ObjectId = require('mongodb').ObjectId;

const db = require('./db');

const sha256 = require('js-sha256');
const salt = "719GxFYNgo";
const pass = "700e78f75bf9abb38e9b2f61b227afe94c204947eb0227174c48f55a4dcc8139";
const FIELD_SEPERATOR = "\t";
const ERROR_STRING = 'error';

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

const processMessageRequest = (req) => {
  const processed = {
    errors: [],
    parsed: {}
  };

  if (!req.body.text || req.body.probability === undefined) {
    processed.errors.push('No data provided!');
  }
  if (req.params.index < 1 || req.params.num < 1) {
    processed.errors.push('Invalid index provided!');
  }

  const isGauge = req.url.includes("gauges");

  if (isGauge && !Array.isArray(req.body.probability)) {
    processed.errors.push('Gauge message probability should be an array!');
  } else if (!isGauge && typeof req.body.probability !== 'number') {
    processed.errors.push('View message probability should be an integer!')
  }

  try {
    processed.parsed.text = req.body.text;
    processed.parsed.probability = req.body.probability;
  } catch (e) {
    if (e instanceof SyntaxError) {
      processed.errors.push('Invalid JSON body!');
    }
  }

  if (!req.body.pass || sha256(req.body.pass + salt) !== pass) {
    processed.errors.push('Invalid password.');
  }

  return processed;
};

const processImportRequest = (req) => {
  const processed = {
    errors: []
  };

  if (!req.files[""]) {
    processed.errors.push('No file provided!');
  }

  if (req.fields.type !== "append" && req.fields.type !== "overwrite") {
    processed.errors.push('Invalid import type.');
  }

  if (!req.fields.pass || sha256(req.fields.pass + salt) !== pass) {
    processed.errors.push('Invalid password.');
  }

  return processed;

}

const updateMessages = (id, path, req) => {
  return db.collection.updateOne(
    {
      _id: new ObjectId(id),
      [path]: { $exists: true }
    },
    {
      $set: {
        [`${path}.text`]: req.parsed.text,
        [`${path}.probability`]: req.parsed.probability
      }
    }
  )
};

/* Constant for what the name in the "gauge" field of the messages spreadsheet
* should be when creating a message attached to a view.
*/
const viewPath = "intro"

const importMessages = (line) => {
  const message = line.split(FIELD_SEPERATOR);

  if (message.length !== 4 && message.length !== 8)
    return ERROR_STRING;

  const viewMessage = (message[1] === viewPath);

  const newMessage = {"text": message[2], "probability": (viewMessage) ? Number(message[3]) : message.splice(3, 5).map(num => Number(num))};

  const path = (viewMessage) ? "view" : "view.gauges.$";

  const query = (path === "view") ? {"view.name" : message[0].toLowerCase()} : {"view.gauges.name": { $regex : new RegExp(message[1], "i") } }

  if (path.match(/\u0000/g))
    return ERROR_STRING;

  return db.collection.updateOne(query,
    {
      $addToSet: {
        [`${path}.messages`] : newMessage
      }
    }
  )
}

const clearMessages = (file, headers) => {
  let overwritten = [];

  lineReader.eachLine(file, function(line) {
    if (headers) headers = false;
    else {
      const message = line.split("\t");

      if (message.length !== 4 && message.length !== 8)
        return ERROR_STRING;

      const viewMessage = (message[1] === viewPath);

      const path = (viewMessage) ? "view" : "view.gauges.$";

      const query = (path === "view") ? {"view.name" : message[0].toLowerCase()} : {"view.gauges.name": { $regex : new RegExp(message[1], "i") } }

      if (path.match(/\u0000/g))
        return ERROR_STRING;

      if (!overwritten.includes(message[1])) {
        db.collection.updateOne(query,
          {
            $set: {
              [`${path}.messages`]: []
            }
          }
        )
        overwritten.push(message[1]);
      }
    }
  });
}

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
      { _id: new ObjectId(req.params._id) },
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
        _id: new ObjectId(req.params._id),
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

// Used to update a message attached to a gauge
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

// Used to update a message attached to a view
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

// This route is used to import messages from a spreadsheet (CSV)
router.use(formidable()).post('/import', (req, res) => {
  const processed = processImportRequest(req);
  const headers = (req.fields.headers) ? req.fields.headers:true;

  let response = [];

  if (processed.errors.length > 0) {
    res.json({
      'errors': processed.errors
    });
  } else {
    if (req.fields.type === "overwrite") clearMessages(req.files[""].path);

    let first = true;
    lineReader.eachLine(req.files[""].path, function(line) {
      if (first) first = false;
      else response.push(importMessages(line));
    }, function (err) {
      res.send(response.includes('error') ? { errors: ['Could not import file.'] } : response);
    });
  }
});

module.exports = router;
