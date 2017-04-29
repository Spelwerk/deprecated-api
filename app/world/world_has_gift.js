var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM world_has_gift ' +
        'LEFT JOIN gift ON gift.id = world_has_gift.gift_id';

    router.get(path + '/id/:id/gift', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_gift.world_id = ? AND ' +
            'gift.canon = ? AND ' +
            'gift.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, 1]);
    });

    router.get(path + '/id/:id/gift/special', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_gift.world_id = ? AND ' +
            'gift.canon = 1 AND ' +
            'gift.manifestation_id IS NULL AND ' +
            'gift.species_id IS NULL AND ' +
            'gift.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/id/:id/gift/species/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_gift.world_id = ? AND ' +
            '(gift.species_id = ? OR gift.species_id IS NULL) AND ' +
            'gift.manifestation_id IS NULL AND ' +
            'gift.canon = ? AND ' +
            'gift.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id2, 1]);
    });

    router.get(path + '/id/:id/gift/species/:id2/manifestation/:id3', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_gift.world_id = ? AND ' +
            '(gift.species_id = ? OR gift.species_id IS NULL) AND ' +
            '(gift.manifestation_id = ? OR gift.manifestation_id IS NULL) AND ' +
            'gift.canon = 1 AND ' +
            'gift.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id2, req.params.id3]);
    });

    router.post(path + '/id/:id/gift', function(req, res) {
        rest.worldPostHas(pool, req, res, req.params.id, 'gift');
    });

    router.delete(path + '/id/:id/gift/:id2', function(req, res) {
        rest.worldDeleteHas(pool, req, res, req.params.id, req.params.id2, 'gift');
    });
};