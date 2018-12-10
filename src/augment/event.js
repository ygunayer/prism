const Joi = require('joi');

const SCHEMA = Joi.object().keys({
    timestamp: Joi.date().required(),
    action: Joi.string().required()
});

async function augment(event) {
    await SCHEMA.validate(event, {allowUnknown: true});

    const {timestamp, action} = event;

    return {
        self: {
            timestamp,
            action
        }
    };
}

module.exports = augment;
