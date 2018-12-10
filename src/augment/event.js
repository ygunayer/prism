const Joi = require('joi');
const moment = require('moment');

const SCHEMA = Joi.object().keys({
    id: Joi.string().uuid().required(),
    timestamp: Joi.date().required(),
    action: Joi.string().required()
});

async function augment(event, {contexts}) {
    await SCHEMA.validate(event, {allowUnknown: true});

    const {id, timestamp, action} = event;

    const contextNames = contexts
        .reduce((acc, ctx) => acc
            .concat(ctx.name)
            .concat(
                (ctx.sub || []).map(name => `${ctx.name}_${name}`)
            )
        , []);

    return {
        self: {
            id,
            timestamp: moment(timestamp).format(),
            action,
            contexts: contextNames
        }
    };
}

module.exports = augment;
