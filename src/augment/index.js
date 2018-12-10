const Joi = require('joi');
const utils = require('@prism/utils');

const SCHEMA = Joi.object().keys({
    context: Joi.string().required()
});

function flattenAugs(augs) {
    return Object.keys(augs).reduce((acc, key) => {
        const {self, sub = null} = augs[key];
        const next = { [key]: self };
        if (sub) {
            Object.keys(sub).forEach(subKey => {
                next[`${key}_${subKey}`] = sub[subKey];
            });
        }
        return {...acc, ...next};
    }, {});
}

async function augment(event) {
    await SCHEMA.validate(event, {allowUnknown: true});

    const contexts = utils.context.parseName(event.context);

    if (contexts.filter(ctx => ctx.name == 'event').length < 1) {
        contexts.unshift({ name: 'event' });
    }

    const augs = await contexts.reduce(async (acc, context) => {
        const next = await acc;
        const augment = require(`./${context.name}`);
        const {self, sub = null} = await augment(event, {contexts, context});
        return {...next, [context.name]: {self, sub}};
    }, Promise.resolve({}));

    return flattenAugs(augs);
}

module.exports = augment;
