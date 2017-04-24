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

    router.get(path + '/id/:id/focus', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_focus.world_id = ? AND ' +
            'focus.canon = ? AND ' +
            'focus.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, 1]);
    });

    router.get(path + '/id/:id/focus/manifestation/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_focus.world_id = ? AND ' +
            '(focus.manifestation_id = ? OR focus.manifestation_id IS NULL) AND ' +
            'focus.canon = ? AND ' +
            'focus.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id2, 1]);
    });

    router.post(path + '/id/:id/focus', function(req, res) {
        rest.worldPostHas(pool, req, res, req.params.id, 'focus');
    });

    router.delete(path + '/id/:id/focus/:id2', function(req, res) {
        rest.worldDeleteHas(pool, req, res, req.params.id, req.params.id2, 'focus');
    });
};