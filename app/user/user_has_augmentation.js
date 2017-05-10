var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT augmentation.id FROM user_has_augmentation ' +
        'LEFT JOIN augmentation ON augmentation.id = user_has_augmentation.augmentation_id';

    router.get(path + '/id/:id/augmentation', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_augmentation.user_id = ? AND ' +
            'augmentation.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/augmentation', function(req, res, next) {
        req.relation.name = 'augmentation';

        rest.userRelationPost(req, res, next);
    });

    router.delete(path + '/id/:id/augmentation/:id2', function(req, res, next) {
        req.relation.name = 'augmentation';

        rest.userRelationDelete(req, res, next);
    });
};