const amqp = require('amqplib');
const debug = require('debug')('prism:rabbitmq');
const {EventEmitter} = require('events');

class Drainer {
    constructor(ch) {
        this._chan = ch;
        this._waitHandle = null;
    }

    async wait() {
        if (!this._chan) {
            throw new Error('Not registered');
        }

        if (!this._waitHandle) {
            debug(`Backpressure detected, waiting for drainage...`);
            
            this._waitHandle = this.waitExclusively();
            this._waitHandle.then(_ => this._waitHandle = null);
        }

        return this._waitHandle;
    }

    async waitExclusively() {
        return new Promise(resolve => {
            this._chan.once('drain', () => resolve());
            debug(`Channel drained, resuming`);
        });
    }

    async dispose() {
        if (this._waitHandle) {
            await this._waitHandle;
            this._waitHandle = null;
        }
    }
}

class RabbitMQ {
    constructor({url}) {
        this.config = {url};

        this._conn = null;
        this._chan = null;
        this._drainer = null;
    }

    async _open() {
        if (this._chan) {
            return this._chan;
        }

        this._conn = await amqp.connect(this.config.url);
        this._chan = await this._conn.createChannel();
        this._drainer = new Drainer(this._chan);
        debug(`Connected to RabbitMQ at ${this.config.url}`);
        return this._chan;
    }

    async close() {
        if (!this._chan) {
            return;
        }

        await this._drainer.dispose();
        await this._chan.close();
        await this._conn.close();
        this._conn = null;
        this._chan = null;
    }

    async declareQueue(name, options = {durable: true}) {
        const ch = await this._open();
        const result = await ch.assertQueue(name, options);
        debug(`Queue ${name} declared`);
        return result;
    }

    async consume(queue, handler) {
        const ch = await this._open();
        const emitter = new EventEmitter();

        const {consumerTag} = await ch.consume(queue, async msg => {
            try {
                const data = JSON.parse(msg.content.toString('utf8'));
                try {
                    await handler(data, msg);
                    ch.ack(msg);
                } catch(e) {
                    console.error('Error in consumer', e);
                    ch.nack(msg);
                }
            } catch (e) {
                debug(`Consumption error on queue ${queue}`, e);
                emitter.emit('error', e);
            }
        }, {noAck: false});

        emitter.dispose = () => ch.cancel(consumerTag);

        return emitter;
    }

    async publish(queue, message) {
        const ch = await this._open();
        const str = JSON.stringify(message, null, 0);
        const buf = new Buffer(str, 'utf8');
        
        const shouldWait = ch.sendToQueue(queue, buf, {contentType: 'application/json'});
        if (shouldWait) {
            await this._drainer.wait();
        }
    }

    async forward(from, to, tx) {
        const emitter = new EventEmitter();
        debug(`Forwarding messages from ${from} to ${to} through ${tx}`);

        const consumer = await this.consume(from, async (data, msg) => {
            try {
                const result = await tx(data, msg);
                this.publish(to, result);
                debug(`Message forwarded`);
            } catch (e) {
                debug(`Forwarding error at ${from}->${to}`, e);
                emitter.emit('error', e);
            }
        });

        consumer.on('error', e => emitter.emit('consumer-error', e));

        return emitter;
    }
}

module.exports = RabbitMQ;
