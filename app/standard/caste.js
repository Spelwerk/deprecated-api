var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'caste.id, ' +
        'caste.name, ' +
        'caste.description, ' +
        'caste.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'caste.attribute_value, ' +
        'caste.icon_id, ' +
        'icon.path AS icon_path, ' +
        'caste.created, ' +
        'caste.deleted ' +
        'FROM caste ' +
        'LEFT JOIN attribute ON attribute.id = caste.attribute_id ' +
        'LEFT JOIN icon ON icon.id = caste.icon_id';

    require('./../default')(pool, router, table, path, query);
};