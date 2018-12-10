require('module-alias/register');

const os = require('os');
const path = require('path');
const config = require('config');
const {BigQuery} = require('@google-cloud/bigquery');

const {projectId, keyFilename, datasetName} = config.get('gcloud');

const actualKeyFilename = path.resolve(keyFilename.replace(/^\~/g, os.homedir()));

const bigquery = new BigQuery({
    keyFilename: actualKeyFilename,
    projectId
});

module.exports = bigquery.dataset(datasetName);
