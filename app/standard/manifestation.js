var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'manifestation.id, ' +
        'manifestation.name, ' +
        'manifestation.description, ' +
        'manifestation.attributetype_id, ' +
        'attributetype.name AS attributetype_name, ' +
        'manifestation.expertisetype_id, ' +
        'expertisetype.name AS expertisetype_name, ' +
        'manifestation.icon_id, ' +
        'icon.path AS icon_path, ' +
        'manifestation.created, ' +
        'manifestation.deleted, ' +
        'manifestation.updated ' +
        'FROM manifestation ' +
        'LEFT JOIN attributetype ON attributetype.id = manifestation.attributetype_id ' +
        'LEFT JOIN expertisetype ON expertisetype.id = manifestation.expertisetype_id ' +
        'LEFT JOIN icon ON icon.id = manifestation.icon_id';

    require('./../default')(pool, router, table, path, query);
};