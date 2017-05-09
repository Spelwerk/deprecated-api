var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT ' +
        'bionic.id, ' +
        'bionic.canon, ' +
        'bionic.name, ' +
        'bionic.description, ' +
        'bionic.price, ' +
        'bionic.energy, ' +
        'bionic.legal, ' +
        'bionic.bodypart_id, ' +
        'bodypart.name AS bodypart_name, ' +
        'bionic.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'bionic.attribute_value, ' +
        'bionic.icon ' +
        'FROM world_has_bionic ' +
        'LEFT JOIN bionic ON bionic.id = world_has_bionic.bionic_id ' +
        'LEFT JOIN bodypart ON bodypart.id = bionic.bodypart_id ' +
        'LEFT JOIN attribute ON attribute.id = bionic.attribute_id';

    router.get(path + '/id/:id/bionic', function(req, res, next) {
        var call = query + ' WHERE ' +
            'bionic.canon = 1 AND ' +
            'world_has_bionic.world_id = ? AND ' +
            'bionic.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/bionic', function(req, res, next) {
        req.table.name = 'world';
        req.table.admin = false;
        req.table.user = true;

        req.relation.name = 'bionic';

        rest.relationPost(req, res, next);
    });

    router.delete(path + '/id/:id/bionic/:id2', function(req, res, next) {
        req.table.name = 'world';
        req.table.admin = false;
        req.table.user = true;

        req.relation.name = 'bionic';

        rest.relationDelete(req, res, next);
    });
};