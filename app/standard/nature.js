var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'nature.id, ' +
        'nature.name, ' +
        'nature.description, ' +
        'nature.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'nature.created, ' +
        'nature.deleted ' +
        'FROM nature ' +
        'LEFT JOIN attribute ON attribute.id = nature.attribute_id';

    require('./../default')(pool, router, table, path, query);
};