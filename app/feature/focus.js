//var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'focus.id, ' +
        'focus.name, ' +
        'focus.description, ' +
        'focus.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'focus.attribute_value, ' +
        'focus.manifestation_id, ' +
        'manifestation.name AS manifestation_name, ' +
        'focus.icon_id, ' +
        'icon.path AS icon_path, ' +
        'focus.created, ' +
        'focus.deleted, ' +
        'focus.updated ' +
        'FROM focus ' +
        'LEFT JOIN attribute ON attribute.id = focus.attribute_id ' +
        'LEFT JOIN manifestation ON manifestation.id = focus.manifestation_id ' +
        'LEFT JOIN icon ON icon.id = focus.icon_id';

    require('./../default')(pool, router, table, path, query);
};