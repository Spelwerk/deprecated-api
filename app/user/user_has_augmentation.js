var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM user_has_augmentation ' +
        'LEFT JOIN augmentation ON augmentation.id = user_has_augmentation.augmentation_id';

    router.get(path + '/id/:id/augmentation', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_augmentation.user_id = ? AND ' +
            'augmentation.deleted IS NULL';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/augmentation', function(req, res, next) {
        rest.userRelationPost(req, res, next, req.params.id, 'augmentation', req.body.insert_id);
    });

    router.delete(path + '/id/:id/augmentation/:id2', function(req, res, next) {
        rest.userRelationDelete(req, res, next, req.params.id, 'augmentation', req.params.id2);
    });
};