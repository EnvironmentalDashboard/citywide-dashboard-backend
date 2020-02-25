const mongo = require('mongodb').MongoClient;

const connect = url => (
  new Promise((resolve, reject) => {
    mongo.connect(url, { useNewParser: true }, (err, database) => {
      if (err) {
        reject(err);
      } else {
        resolve(database.db().collection('activeGlyphs'));
      }
    });
  })
);

module.exports = { connect };
