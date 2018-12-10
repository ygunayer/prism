const {EventEmitter} = require('events');

function number({min = 0, max = 1}) {
    return parseInt(min + (max - min) * Math.random());
}

const initialTime = Date.now();

function event({from = initialTime - 86400, to = initialTime} = {}) {
    return {
        context: 'device, content, plugin(playlist)',
        action: 'item_completed',
        timestamp: new Date(number({min: from, max: to})).toString(),
        pluginName: 'playlist',
        pluginVersion: '1.3.0',
        playerId: 'foobarasdfadfa',
        deviceId: number({min: 1000, max: 10000}),
        mediaId: number({min: 100, max: 1000}),
        contentVersionId: number({min: 10, max: 100}),
        location: {
            lat: number({min: 36000000, max: 4500000})/1000000,
            lon: number({min: 26000000, max: 3600000})/1000000,
        }
    };
}

function eventsBulk(size) {
    let emitter = new EventEmitter();
    process.nextTick(() => {
        emitter.emit('start');
        for (let i = 0; i < size; i++) {
            emitter.emit('item', event());
        }
        emitter.emit('end');
    });
    return emitter;
}

module.exports = {
    event,
    eventsBulk,
    number
};
