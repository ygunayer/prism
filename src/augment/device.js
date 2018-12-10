const Joi = require('joi');
const utils = require('@prism/utils');

const SCHEMA = Joi.object().keys({
    deviceId: Joi.number().required()
});

async function augment(event) {
    await SCHEMA.validate(event, {allowUnknown: true});

    const {deviceId, location} = event;

    return {
        self: {
            deviceId,
            shopId: deviceId * 33,
            accountId: deviceId * 121,
            location,
            shopLocation: utils.random.coordinates()
        }
    };
}

module.exports = augment;
