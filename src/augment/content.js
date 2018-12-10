const Joi = require('joi');

const SCHEMA = Joi.object().keys({
    contentVersionId: Joi.number().required()
});

async function augment(event) {
    await SCHEMA.validate(event, {allowUnknown: true});

    const {contentVersionId} = event;

    return {
        self: {
            contentVersionId,
            contentId: contentVersionId * 15,
            isPristine: contentVersionId % 2 == 1
        }
    };
}

module.exports = augment;
