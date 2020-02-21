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

};

module.exports = { canRun, run };
