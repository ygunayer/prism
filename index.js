require('module-alias/register');

const config = require('config');
const augment = require('@prism/augment');
const RabbitMQ = require('@prism/lib/rabbitmq');

const rabbit = new RabbitMQ(config.get('rabbitmq.url'));

rabbit.declareQueue('events-raw', {durable: true});
rabbit.declareQueue('events-processed', {durable: true});

rabbit.forward('events-raw', 'events-processed', augment)
    .then(e => {
        console.log('Now forwarding events');

        e.on('error', err => console.error(err));
    });
