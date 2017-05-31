var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT location.id FROM user_has_location ' +
        'LEFT JOIN location ON location.id = user_has_location.location_id';

    router.get(path + '/id/:id/location', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_location.user_id = ? AND ' +
            'location.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/location', function(req, res, next) {
        rest.userRelationPost(req, res, next, req.params.id, 'location', req.body.insert_id);
    });

    router.delete(path + '/id/:id/location/:id2', function(req, res, next) {
        rest.userRelationDelete(req, res, next, req.params.id, 'location', req.params.id2);
    });
};