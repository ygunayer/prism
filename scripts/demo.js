require('module-alias/register');

const utils = require('@prism/utils');
const augment = require('@prism/augment');

const event = utils.random.event();
augment(event)
    .then(e => {
        console.info(`Raw:`)
        console.info(JSON.stringify(event, null, 4));

        console.info(`Augmented:`)
        console.info(JSON.stringify(e, null, 4));
    })
    .catch(console.error.bind(console));
