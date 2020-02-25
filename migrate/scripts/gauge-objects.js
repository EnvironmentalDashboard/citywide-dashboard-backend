const canRun = collection => (
  new Promise((resolve, reject) => {
    collection.find({
      'view': {
        $exists: true
      }
    })
    .toArray()
    .then(r => {
      const gauges = r.map(e => e.view.gauges);

      // If any of our gauges is simply a string, we should transition.
      // First, the mapping turns each gauge entry into a boolean saying whether
      // it contains any string gauges or not.
      // Then, we simply see if any of the gauges contains this status.
      resolve(gauges.map(g => g.some(e => typeof e === 'string')).some(g => g));
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
      gauges: entry.view.gauges
    }))
  ))
  .then(gaugeEntries => {
    gaugeEntries.forEach(gauge => {
      // Maps our old gauge type (string) into our new type (object).
      const newGauges = gauge.gauges.map(e => (
        typeof e === 'string' ? (
          {
            url: e
          }
        ) : (
          e
        )
      ));

      collection.update(
        {
          _id: gauge.id
        },
        {
          $set: {
            'view.gauges': newGauges
          }
        }
      )
      .then(wc => {
        if (!wc.writeConcernError) {
          console.log(`Successfully updated ${gauge.id}`);
        } else {
          console.error(`Error updating ${gauge.id}`);
        }
      });
    });
  });
};

module.exports = { canRun, run };
