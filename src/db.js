const mongo = require('mongodb').MongoClient;
const url = process.env.DATABASE_URL || 'mongodb://cwd-mongo:27017/cleveland-cwd';

MongoClient.connect(url, { useNewParser: true }, (err, database) => { module.exports = database });

module.exports = null;
