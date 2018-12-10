require('module-alias/register');

const config = require('config');
const augment = require('@prism/augment');
const RabbitMQ = require('@prism/lib/rabbitmq');
const bigquery = require('@prism/lib/bigquery');

const rabbit = new RabbitMQ(config.get('rabbitmq.url'));

rabbit.declareQueue('events-raw', {durable: true});
rabbit.declareQueue('events-processed', {durable: true});

rabbit.forward('events-raw', 'events-processed', augment)
    .then(e => {
        console.log('Now forwarding events');

        e.on('error', err => console.error(err));
    });

rabbit.consume('events-processed', event => {
    const insertions = Object.keys(event)
        .filter(name => name != 'contexts')
        .map(name => ({
            field: name,
            table: name == 'event' ? 'event_data' : `${name}_event_data`
        }));
    
    console.log(insertions);
    throw new Error('ASDKAKDA');
})
    .then(() => console.log('Now waiting for procesesed events'));
