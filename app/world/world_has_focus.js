var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'focus.id, ' +
        'focus.canon, ' +
        'focus.name, ' +
        'focus.description, ' +
        'focus.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'focus.attribute_value, ' +
        'focus.manifestation_id, ' +
        'manifestation.name AS manifestation_name, ' +
        'icon.path AS icon_path ' +
        'FROM world_has_focus ' +
        'LEFT JOIN focus ON focus.id = world_has_focus.focus_id ' +
        'LEFT JOIN attribute ON attribute.id = focus.attribute_id ' +
        'LEFT JOIN manifestation ON manifestation.id = focus.manifestation_id ' +
        'LEFT JOIN icon ON icon.id = focus.icon_id';

    require('../default-has')(pool, router, table, path, ["world_id","focus_id"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_focus.world_id = ? AND ' +
            'focus.canon = ? AND ' +
            'focus.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, 1]);
    });

    router.get(path + '/id/:id1/manifestation/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_focus.world_id = ? AND ' +
            '(focus.manifestation_id = ? OR focus.manifestation_id IS NULL) AND ' +
            'focus.canon = ? AND ' +
            'focus.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2, 1]);
    });
};