const Joi = require('joi');

const SCHEMA = Joi.object().keys({
    pluginName: Joi.string().required(),
    pluginVersion: Joi.string().required()
});

async function augment(event, ctx) {
    await SCHEMA.validate(event, {allowUnknown: true});

    const {pluginName, pluginVersion} = event;

    const subContexts = await ctx.sub.reduce(async (acc, sub) => {
        const augmenter = require(`./${sub}`);
        const result = await augmenter(event, ctx, sub);
        const next = await acc;
        return {...next, [sub]: result};
    }, Promise.resolve({}));

    return {
        self: {
            pluginName,
            pluginVersion
        },
        sub: subContexts
    };
}

module.exports = augment;
