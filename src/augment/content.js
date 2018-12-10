const Joi = require('joi');

const SCHEMA = Joi.object().keys({
    id: Joi.string().uuid().required(),
    contentVersionId: Joi.number().required()
});

async function augment(event) {
    await SCHEMA.validate(event, {allowUnknown: true});

    const {id, contentVersionId} = event;

    return {
        self: {
            eventId: id,
            contentVersionId,
            contentId: contentVersionId * 15,
            isPristine: contentVersionId % 2 == 1
        }
    };
}

module.exports = augment;
