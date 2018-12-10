const stringUtils = require('./string');

function fixFieldNames(data) {
    if (!data) {
        return data;
    }

    return Object.keys(data).reduce((acc, field) => {
        const snakeCase = stringUtils.toSnakeCase(field);
        return {
            ...acc,
            [snakeCase]: data[field]
        }
    }, {});
};

function coordsAsGeoJSON({lat, lon}) {
    return {
        type: 'Point',
        coordinates: [lon, lat]
    };
}

module.exports = {
    fixFieldNames,
    coordsAsGeoJSON
};
