const mongo = require('mongodb').MongoClient;
const url = process.env.DATABASE_URL || 'mongodb://cwd-mongo:27017/cleveland-cwd';

mongo.connect(url, { useNewParser: true }, (err, database) => {
  module.exports.collection = database.db().collection('activeGlyphs')
});

module.exports = { collection: null };
