const canRun = collection => (
  new Promise((resolve, reject) => {
    collection.find({
      'view': {
        $exists: true
      }
    })
    .toArray()
    .then(r => {
      const messages = r.map(e => e.view.message);

      resolve(messages.some(m => m));
    });
  })
);

const run = collection => {
  collection.find({
    'view': {
      $exists: true
    }
  })
  .toArray()
  .then(result => (
    result.map(entry => ({
      id: entry._id,
      message: entry.view.message
    }))
  ))
  .then(messageEntries => {
    messageEntries.forEach(messageEntry => {
      // Maps our old gauge type (string) into our new type (object).
      const messages = Array.isArray(messageEntry) ? (
        messageEntry
      ) : (
        [
          {
            'text': messageEntry.message,
            'probability': 1
          }
        ]
      );

      collection.update(
        {
          _id: messageEntry.id
        },
        {
          $set: {
            'view.messages': messages
          },
          $unset: {
            'view.message': ''
          }
        }
      )
      .then(wc => {
        if (!wc.writeConcernError) {
          console.log(`Successfully updated ${messageEntry.id}`);
        } else {
          console.error(`Error updating ${messageEntry.id}`);
        }
      });
    });
  });
};

module.exports = { canRun, run };
