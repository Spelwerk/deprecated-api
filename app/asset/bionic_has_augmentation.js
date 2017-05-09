var rest = require('../rest');

module.exports = function(router, path) {
    var query = 'SELECT ' +
        'augmentation.id, ' +
        'augmentation.canon, ' +
        'augmentation.name, ' +
        'augmentation.description, ' +
        'augmentation.price, ' +
        'augmentation.energy, ' +
        'augmentation.legal, ' +
        'augmentation.weapon_id, ' +
        'FROM bionic_has_augmentation ' +
        'LEFT JOIN augmentation ON augmentation.id = bionic_has_augmentation.augmentation_id';

    router.get(path + '/id/:id/augmentation', function(req, res, next) {
        var call = query + ' WHERE ' +
            'bionic_has_augmentation.bionic_id = ? AND ' +
            'augmentation.canon = 1 AND ' +
            'augmentation.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/augmentation', function(req, res, next) {
        req.table.name = 'bionic';
        req.table.admin = false;
        req.table.user = true;

        req.relation.name = 'augmentation';

        rest.relationPost(req, res, next);
    });

    router.delete(path + '/id/:id/augmentation/:id2', function(req, res, next) {
        req.table.name = 'bionic';
        req.table.admin = false;
        req.table.user = true;

        req.relation.name = 'augmentation';

        rest.relationDelete(req, res, next);
    });
};