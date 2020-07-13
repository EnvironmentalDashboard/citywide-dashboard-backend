const querystring = require('querystring');

const urlToDataUrl = url => {
  if (!url) {
    return url;
  } else {
    const parsed = querystring.parse(url);

    return `https://qa.communityhub.cloud/data-hub/meters/compare/${parsed.prim}/${parsed.comp}`;
  }
};

const canRun = collection => (
  new Promise((resolve, reject) => {
    collection.find({
      'view': {
        $exists: true
      }
    })
    .toArray()
    .then(r => {
      // Each view is turned into only its gauge entry,
      // so therefore we now have an array of arrays of gauges.
      const gauges = r.map(e => e.view.gauges);

      // If any of our gauge entries has a gauge that has a URL but not a data URL.
      resolve(gauges.map(e => e.some(g => g.url && !g.data_url)).some(e => e));
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
    gaugeEntries.forEach(gaugeEntry => {
      // Loops over each gauge.
      gaugeEntry.gauges.forEach((gauge, index) => {
        const dataUrl = gauge.data_url || urlToDataUrl(gauge.url);

        collection.update(
          {
            _id: gaugeEntry.id
          },
          {
            $set: {
              [`view.gauges.${index}.data_url`]: dataUrl
            }
          }
        )
        .then(wc => {
          if (!wc.writeConcernError) {
            console.log(`Successfully updated ${gaugeEntry.id}`);
          } else {
            console.error(`Error updating ${gaugeEntry.id}`);
          }
        });
      });
    });
  });
};

module.exports = { canRun, run };
