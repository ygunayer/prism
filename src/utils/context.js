const Joi = require('joi');

const CONTEXT_SCHEMA = Joi.object().keys({
    name: Joi.string().required(),
    sub: Joi.array().items(Joi.string()).required()
});

/**
 * Parses a comma-separated list of context names into a set of contexts
 */
function parseName(s) {
    return (s || '').split(',')
        .map(str => {
            const matches = /(\w+)\s*\(?\s*([\w,\s]*)\s*\)?/g.exec(str.trim());

            if (!matches || !matches[1]) {
                return null;
            }

            const ctx = {
                name: matches[1],
                sub: []
            };

            if (matches[2]) {
                ctx.sub = matches[2].trim().split(',').map(s => s.trim()).filter(s => !!s);
            }
            
            return ctx;
        })
        .reduce((acc, ctx) => {
            if (!ctx) {
                return acc;
            }

            if (acc.visit[ctx.name]) {
                return acc;
            }
            
            acc.set.push(ctx);
            acc.visit[ctx.name] = true;
            return acc;
        }, { set: [], visit: {} }).set;
}

/**
 * Constructs a context name from a given context.
 */
async function getName(ctx) {
    await CONTEXT_SCHEMA.validate(ctx);
    if (ctx.sub.length < 1) {
        return ctx.name;
    }

    return `${ctx.name}(${ctx.sub.join(',')})`;
}

module.exports = {
    parseName,
    getName
};
