var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM world_has_weaponmod ' +
        'LEFT JOIN weaponmod ON weaponmod.id = world_has_weaponmod.weaponmod_id';

    router.get(path + '/id/:id/weaponmod', function(req, res, next) {
        var call = query + ' WHERE ' +
            'world_has_weaponmod.world_id = ? AND ' +
            'weaponmod.deleted IS NULL';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/id/:id/weaponmod/type/:id2', function(req, res, next) {
        var call = query + ' WHERE ' +
            'world_has_weaponmod.world_id = ? AND ' +
            'weaponmod.weapontype_id = ? AND ' +
            'weaponmod.deleted IS NULL';

        rest.GET(req, res, next, call, [req.params.id, req.params.id2]);
    });

    router.post(path + '/id/:id/weaponmod', function(req, res, next) {
        rest.relationPost(req, res, next, 'world', req.params.id, 'weaponmod', req.body.insert_id);
    });

    router.delete(path + '/id/:id/weaponmod/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'world', req.params.id, 'weaponmod', req.params.id2);
    });
};