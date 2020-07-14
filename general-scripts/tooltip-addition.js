const db  = require('../migrate/db.js')
const ObjectId = require('mongodb').ObjectID
const ID_STRING = "5d3f2b8672a1dcb5f8566562" //ID of corresponding entry.
const insertObject =  {"header" : "Water Treatment Plant", "text" : "Water from lakes, rivers, aquifers and even the ocean is collected and treated through a variety of processes to achieve needed water qualities for end uses such as drinking, irrigation, or industrial use.", "links" : []}

//Make the call directly to the database
const createToolTip = () => {
  return db.collection.update(
    { _id: new ObjectId(ID_STRING) },
    { $set: {
      [`props.tooltip`] : { "header" : "Water Treatment Plant",
                            "text" : "Water from lakes, rivers, aquifers and even the ocean is collected and treated through a variety of processes to achieve needed water qualities for end uses such as drinking, irrigation, or industrial use.",
                            "links" : []
                          },
      [`props.clickEffect`] : "showToolTip"
      }
    }
  );
}

createToolTip();
