const qs = require('querystring');

const urltoGaugeName = url => {
  if (!url) return url;
  else {
    const parsed = JSON.parse(JSON.stringify(qs.decode(url)));

    return parsed.title.toLowerCase();
  }
}


const canRun = collection => {
  new Promise((resolve, reject) => {
    collection.find({
      'view' : { $exists: true }
    })
    .toArray()
    .then(r => {
      //the array of array of gauges
      const gauges = r.map(e => e.view.gauges);

      //grab gauges that don't yet have a name field
      resolve(gauges.map(e => e.some(g => g.url && !g.name)).some(e => e));
    });
  })
};

const run = collection => {
  collection.find({
    'view' : { $exists : true }
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
        const gaugeName = gauge.name || urltoGaugeName(gauge.url);

        collection.update(
          {
            _id: gaugeEntry.id
          },
          {
            $set: {
              [`view.gauges.${index}.name`]: gaugeName
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
}

module.exports { canRun, run };
