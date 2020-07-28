const ObjectId = require('mongodb').ObjectID
const ID_STRING = "5d3f2b8672a1dcb5f8566562" //ID of corresponding entry.

const canRun = collection => (
  new Promise ((resolve, reject) => {
    collection.find({
      "_id" : ObjectId(ID_STRING)
    })
    .toArray()
    .then(r => {
      resolve(r.some(i => i._id))
    });
  })
)

const run = collection => {
  collection.find({
    "_id" : ObjectId(ID_STRING)
  })
  .toArray()
  .then(idEntries => {
    idEntries.forEach(idEntry => {
      collection.updateOne(
        { _id: new ObjectId(ID_STRING) },
        { $set: {
          "props.tooltip" : { "header" : "Water Treatment Plant",
                                "text" : "Water from lakes, rivers, aquifers and even the ocean is collected and treated through a variety of processes to achieve needed water qualities for end uses such as drinking, irrigation, or industrial use.",
                                "links" : []
                              },
          "props.clickEffect" : "showTooltip"
          }
        }
      )
    })
  })
}
module.exports = { canRun, run };
