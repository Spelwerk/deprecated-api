var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM world_has_gift ' +
        'LEFT JOIN gift ON gift.id = world_has_gift.gift_id';

    router.get(path + '/id/:id/gift', function(req, res, next) {
        var call = query + ' WHERE ' +
            'world_has_gift.world_id = ? AND ' +
            'gift.species_id IS NULL AND ' +
            'gift.manifestation_id IS NULL AND ' +
            'gift.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/id/:id/gift/species/:id2', function(req, res, next) {
        var call = query + ' WHERE ' +
            'world_has_gift.world_id = ? AND ' +
            '(gift.species_id = ? OR gift.species_id IS NULL) AND ' +
            'gift.manifestation_id IS NULL AND ' +
            'gift.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id, req.params.id2]);
    });

    router.get(path + '/id/:id/gift/species/:id2/manifestation/:id3', function(req, res, next) {
        var call = query + ' WHERE ' +
            'world_has_gift.world_id = ? AND ' +
            '(gift.species_id = ? OR gift.species_id IS NULL) AND ' +
            '(gift.manifestation_id = ? OR gift.manifestation_id IS NULL) AND ' +
            'gift.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id, req.params.id2, req.params.id3]);
    });

    router.post(path + '/id/:id/gift', function(req, res, next) {
        rest.relationPost(req, res, next, 'world', req.params.id, 'gift', req.body.insert_id);
    });

    router.delete(path + '/id/:id/gift/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'world', req.params.id, 'gift', req.params.id2);
    });
};