const {EventEmitter} = require('events');
const uuid = require('uuid/v4');

function integer({min = 0, max = 1} = {}) {
    return parseInt(float({min, max}));
}

function float({min = 0, max = 1} = {}) {
    return min + (max - min) * Math.random();
}

const initialTime = Date.now();

function coordinates({minLat = 36, maxLat = 45, minLon = 26, maxLon = 36} = {}) {
    return {
        lat: float({min: minLat, max: maxLat}),
        lon: float({min: minLon, max: maxLon})
    };
}

function event({from = initialTime - 86400, to = initialTime} = {}) {
    return {
        id: uuid(),
        context: 'device, content, plugin(playlist)',
        action: 'item_completed',
        timestamp: +(new Date(integer({min: from, max: to}))),
        pluginName: 'playlist',
        pluginVersion: '1.3.0',
        playerId: 'foobarasdfadfa',
        deviceId: integer({min: 1000, max: 10000}),
        mediaId: integer({min: 100, max: 1000}),
        contentVersionId: integer({min: 10, max: 100}),
        location: coordinates()
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
    integer,
    float,
    coordinates
};
