require('module-alias/register');

const bigquery = require('@prism/lib/bigquery');

bigquery.getTables()
    .then(console.log.bind(console))
    .catch(console.error.bind(console));
