var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'identity.id, ' +
        'identity.name, ' +
        'identity.description, ' +
        'identity.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'identity.created, ' +
        'identity.deleted ' +
        'FROM identity ' +
        'LEFT JOIN attribute ON attribute.id = identity.attribute_id';

    require('./../default')(pool, router, table, path, query);
};