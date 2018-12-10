require('module-alias/register');

const config = require('config');
const augment = require('@prism/augment');
const RabbitMQ = require('@prism/lib/rabbitmq');
const bigquery = require('@prism/lib/bigquery');
const utils = require('@prism/utils');

const rabbit = new RabbitMQ(config.get('rabbitmq.url'));

rabbit.declareQueue('events-raw', {durable: true});
rabbit.declareQueue('events-processed', {durable: true});

rabbit.forward('events-raw', 'events-processed', augment)
    .then(e => {
        console.log('Now forwarding events');

        e.on('error', err => console.error(err));
    });

rabbit.consume('events-processed', async data => {
    const insertions = Object.keys(data)
        .filter(name => name != 'contexts')
        .map(name => ({
            table: name == 'event' ? 'events' : `${name}_event_data`,
            row: utils.db.fixFieldNames(data[name])
        }))
        .map(async ({table, row}) => 
            bigquery
                .table(table)
                .insert(row)
                .catch(err => {
                    const errData = {
                        message: 'An error has occurred while inserting event',
                        table,
                        errors: err.errors,
                        raw: err
                    };
                    console.error(`BigQuery insertion error`, JSON.stringify(err, null, 4))
                    throw new Error(errData);
                })
        );

    return Promise.all(insertions)
        .then(_ => console.info('Row inserted'));
})
    .then(() => console.log('Now waiting for procesesed events'));
