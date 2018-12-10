const Joi = require('joi');

const MAX_CUSTOM_ITEMS = 16;

const ITEM_KEYS = new Array(MAX_CUSTOM_ITEMS).fill(0).map((_, i) => `custom${i + 1}`);

const SCHEMA = Joi.object().keys(
    ITEM_KEYS.reduce((acc, key) => {
        acc[key] = Joi.string();
        return acc;
    }, {id: Joi.string().uuid().required()})
);

async function augment(event) {
    await SCHEMA.validate(event, {allowUnknown: true});

    const data = ITEM_KEYS.reduce((acc, key) => {
        if (!event.hasOwnProperty[key]) {
            return acc;
        }

        acc[key] = event[key];
    }, {});

    return {
        self: {
            eventId: event.id,
            ...data
        }
    };
}

module.exports = augment;
