var mongodb = require("mongodb"),
    ObjectId = mongodb.ObjectId

const canRun = collection => (
  new Promise((resolve, reject) => {
    collection.find({
      '_id': {
        $type: "string"
      }
    })
    .toArray()
    .then(r => {
      const ids = r.map(e => e._id);

      resolve(ids.some(i => i));
    });
  })
);

const run = collection => {
  let itr = 0;
  collection.find({
    '_id': {
      $exists: true
    }
  })
  .toArray()
  .then(idEntries => {
    idEntries.forEach(idEntry => {
      if (typeof idEntry._id === "string") {
        let newId = ObjectId(idEntry._id);
        let oldId = idEntry._id;
        idEntry._id = newId;
        collection.insertOne(idEntry);
        collection.deleteOne({ _id: oldId });
        console.log(`Successfully updated ${idEntry._id}`)
      }
    });
  });
};

module.exports = { canRun, run };
