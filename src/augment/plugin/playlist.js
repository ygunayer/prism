const Joi = require('joi');

const SCHEMA = Joi.object().keys({
    id: Joi.string().uuid().required(),
    playerId: Joi.string().required(),
    mediaId: Joi.number(),
    itemDuration: Joi.number()
});

async function augment(event) {
    await SCHEMA.validate(event, {allowUnknown: true});

    const {id, mediaId, itemDuration, playerId} = event;

    return {
        eventId: id,
        mediaId,
        itemDuration,
        playerId
    };
}

module.exports = augment;
