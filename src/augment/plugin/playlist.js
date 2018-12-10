const Joi = require('joi');

const SCHEMA = Joi.object().keys({
    playerId: Joi.string().required(),
    mediaId: Joi.number(),
    itemDuration: Joi.number()
});

async function augment(event, parent, ctx) {
    await SCHEMA.validate(event, {allowUnknown: true});

    const {mediaId, itemDuration, playerId} = event;

    return {
        mediaId,
        itemDuration,
        playerId
    };
}

module.exports = augment;
