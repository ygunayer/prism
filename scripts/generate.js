require('module-alias/register');

const config = require('config');
const utils = require('@prism/utils');
const RabbitMQ = require('@prism/lib/rabbitmq');

const SIZE = Number(process.argv[2]) || 100000;

const rabbit = new RabbitMQ(config.get('rabbitmq'));

rabbit.declareQueue('events-raw')
    .then(() => {
        let cnt = 0;
        const eventStream = utils.random.eventsBulk(SIZE);

        eventStream.on('item', event => {
            cnt++;
            rabbit.publish('events-raw', event);
        });
        
        eventStream.on('end', async () => {
            await rabbit.close();
            console.log(`Done after ${cnt} items`);
            process.exit(0);
        });
        
        eventStream.on('error', async (err) => {
            await rabbit.close();
            console.error(err);
            process.exit(-1);
        });
    });
