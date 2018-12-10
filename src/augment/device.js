const Joi = require('joi');
const utils = require('@prism/utils');

const SCHEMA = Joi.object().keys({
    id: Joi.string().uuid().required(),
    deviceId: Joi.number().required()
});

async function augment(event) {
    await SCHEMA.validate(event, {allowUnknown: true});

    const {id, deviceId, location} = event;

    return {
        self: {
            eventId: id,
            deviceId,
            shopId: deviceId * 33,
            accountId: deviceId * 121,
            deviceLocation: utils.db.coordsAsGeoJSON(location),
            shopLocation: utils.db.coordsAsGeoJSON(utils.random.coordinates())
        }
    };
}

module.exports = augment;
