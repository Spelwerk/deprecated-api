var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'bionic.id, ' +
        'bionic.canon, ' +
        'bionic.name, ' +
        'bionic.description, ' +
        'bionic.price, ' +
        'bionic.energy, ' +
        'bionic.legal, ' +
        'bionic.bodypart_id, ' +
        'bodypart.name AS bodypart_name, ' +
        'bionic.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'bionic.attribute_value, ' +
        'bionic.icon_id, ' +
        'icon.path AS icon_path ' +
        'FROM world_has_bionic ' +
        'LEFT JOIN bionic ON bionic.id = world_has_bionic.bionic_id ' +
        'LEFT JOIN bodypart ON bodypart.id = bionic.bodypart_id ' +
        'LEFT JOIN attribute ON attribute.id = bionic.attribute_id ' +
        'LEFT JOIN icon ON icon.id = bionic.icon_id';

    router.get(path + '/id/:id/bionic', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_bionic.world_id = ? AND ' +
            'bionic.canon = ? AND ' +
            'bionic.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, 1]);
    });

    router.get(path + '/id/:id/bionic/bodypart/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_bionic.world_id = ? AND ' +
            'bionic.bodypart_id = ? AND ' +
            'bionic.canon = ? AND ' +
            'bionic.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id2, 1]);
    });

    router.post(path + '/id/:id/bionic', function(req, res) {
        rest.worldPostHas(pool, req, res, req.params.id, 'bionic');
    });

    router.delete(path + '/id/:id/bionic/:id2', function(req, res) {
        rest.worldDeleteHas(pool, req, res, req.params.id, req.params.id2, 'bionic');
    });
};