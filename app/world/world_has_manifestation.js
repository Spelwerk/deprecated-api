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
        'manifestation.power_attribute_id, ' +
        'manifestation.skill_attributetype_id, ' +
        'icon.path AS icon_path ' +
        'FROM world_has_manifestation ' +
        'LEFT JOIN manifestation ON manifestation.id = world_has_manifestation.manifestation_id ' +
        'LEFT JOIN attributetype ON attributetype.id = manifestation.attributetype_id ' +
        'LEFT JOIN expertisetype ON expertisetype.id = manifestation.expertisetype_id ' +
        'LEFT JOIN icon ON icon.id = manifestation.icon_id';

    require('../default-has')(pool, router, table, path, ["world_id","manifestation_id"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_manifestation.world_id = ? AND ' +
            'manifestation.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};