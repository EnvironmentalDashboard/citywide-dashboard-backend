const ObjectId = require('mongodb').ObjectID

const canRun = collection => (
  new Promise ((resolve, reject) => {
    collection.find({
      name: 'powerline'
    })
    .toArray()
    .then(r => {
      resolve(r.length > 0)
    });
  })
)

const run = collection => {
  collection.find({
    name: 'powerline'
  })
  .toArray()
  .then(idEntries => {
    idEntries.forEach(idEntry => {
      collection.updateOne(
        { _id: idEntry._id },
        {
          $set: {
            data_url: "https://qa.communityhub.cloud/data-hub/meters/compare/1414c3a0-cda7-11e8-9c46-02420aff0702/1414c3a0-cda7-11e8-9c46-02420aff0702",
            'animators.pathMover.maxDuration': idEntry.animators.pathMover.duration
          },
          $unset: {
            'animators.pathMover.duration': ''
          }
        }
      )
      .then(wc => {
        if (!wc.writeConcernError) {
          console.log(`Successfully updated ${idEntry._id}`);
        } else {
          console.error(`Error updating ${idEntry._id}`);
        }
      })
    })
  })
}
module.exports = { canRun, run };
