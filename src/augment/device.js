const Joi = require('joi');

const SCHEMA = Joi.object().keys({
    deviceId: Joi.number().required()
});

async function augment(event) {
    await SCHEMA.validate(event, {allowUnknown: true});

    const {deviceId} = event;

    return {
        self: {
            deviceId,
            shopId: deviceId * 33,
            accountId: deviceId * 121
        }
    };
}

module.exports = augment;
