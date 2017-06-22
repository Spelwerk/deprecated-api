var async = require('async'),
    rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM world_has_manifestation ' +
        'LEFT JOIN manifestation ON manifestation.id = world_has_manifestation.manifestation_id';

    router.get(path + '/id/:id/manifestation', function(req, res, next) {
        var call = query + ' WHERE ' +
            'world_has_manifestation.world_id = ? AND ' +
            'manifestation.deleted IS NULL';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/manifestation', function(req, res, next) {
        rest.relationPost(req, res, next, 'world', req.params.id, 'manifestation', req.body.insert_id);
    });

    router.delete(path + '/id/:id/manifestation/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'world', req.params.id, 'manifestation', req.params.id2);
    });
};