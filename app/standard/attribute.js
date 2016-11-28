var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'attribute.id, ' +
        'attribute.name, ' +
        'attribute.description, ' +
        'attribute.protected, ' +
        'attribute.attributetype_id, ' +
        'attributetype.name AS attributetype_name, ' +
        'attributetype.maximum, ' +
        'attribute.species_id, ' +
        'species.name AS species_name, ' +
        'attribute.icon_id, ' +
        'icon.path AS icon_path, ' +
        'attribute.created, ' +
        'attribute.deleted,' +
        'attribute.updated ' +
        'FROM attribute ' +
        'LEFT JOIN attributetype ON attributetype.id = attribute.attributetype_id ' +
        'LEFT JOIN species ON species.id = attribute.species_id ' +
        'LEFT JOIN icon ON icon.id = attribute.icon_id';

    require('./../default')(pool, router, table, path, query);
};