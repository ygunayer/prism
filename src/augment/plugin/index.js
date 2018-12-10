const Joi = require('joi');

const SCHEMA = Joi.object().keys({
    id: Joi.string().uuid().required(),
    pluginName: Joi.string().required(),
    pluginVersion: Joi.string().required()
});

async function augment(event, {context, contexts}) {
    await SCHEMA.validate(event, {allowUnknown: true});

    const {id, pluginName, pluginVersion} = event;

    const subContexts = await context.sub.reduce(async (acc, sub) => {
        const augmenter = require(`./${sub}`);
        const result = await augmenter(event, {context: sub, parent: context, contexts});
        const next = await acc;
        return {...next, [sub]: result};
    }, Promise.resolve({}));

    return {
        self: {
            eventId: id,
            pluginName,
            pluginVersion
        },
        sub: subContexts
    };
}

module.exports = augment;
