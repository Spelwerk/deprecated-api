var rest = require('../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

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

    router.get(path + '/id/:id/augmentation', function(req, res) {
        var call = query + ' WHERE ' +
            'bionic_has_augmentation.bionic_id = ? AND ' +
            'augmentation.canon = 1 AND ' +
            'augmentation.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path + '/id/:id/augmentation', function(req, res) {
        rest.relationPost(pool, req, res, 'bionic', 'augmentation');
    });

    router.delete(path + '/id/:id/augmentation/:id2', function(req, res) {
        rest.relationDelete(pool, req, res, 'bionic', 'augmentation');
    });
};