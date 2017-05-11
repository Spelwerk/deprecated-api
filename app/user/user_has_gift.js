var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT gift.id FROM user_has_gift ' +
        'LEFT JOIN gift ON gift.id = user_has_gift.gift_id';

    router.get(path + '/id/:id/gift', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_gift.user_id = ? AND ' +
            'gift.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/gift', function(req, res, next) {
        req.relation.name = 'gift';

        rest.userRelationPost(req, res, next);
    });

    router.delete(path + '/id/:id/gift/:id2', function(req, res, next) {
        req.relation.name = 'gift';

        rest.userRelationDelete(req, res, next);
    });
};