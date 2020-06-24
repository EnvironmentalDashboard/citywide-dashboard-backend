const db  = require('../db.js')

const ObjectID = require('mongodb').ObjectID
const ID_String = "5d3f2b8672a1dcb5f8566562" //ID of corresponding entry.

//Make the call directly to the database
const createToolTip = id => {
  return db.collection.update(
    { _id: new ObjectId(id) },
    { $set:
       { props.tooltip :
          { "header" : "Water Treatment Plant" },
          { "text" : "Blurb goes here!" },        //Once Rowan writes a blurb we can stick it in here.
          { "links" : [] }
        },
        { props.clickEffect : "showTooltip" }
    }
  )
};
