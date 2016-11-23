var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'nature.id, ' +
        'nature.name, ' +
        'nature.description, ' +
        'nature.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'nature.attribute_value, ' +
        'nature.icon_id, ' +
        'icon.path AS icon_path, ' +
        'nature.created, ' +
        'nature.deleted, ' +
        'nature.updated ' +
        'FROM nature ' +
        'LEFT JOIN attribute ON attribute.id = nature.attribute_id ' +
        'LEFT JOIN icon ON icon.id = nature.icon_id';

    require('./../default')(pool, router, table, path, query);
};