var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM bionic_has_attribute ' +
        'LEFT JOIN attribute ON attribute.id = bionic_has_attribute.attribute_id';

    router.get(path + '/id/:id/attribute', function(req, res, next) {
        var call = query + ' WHERE ' +
            'bionic_has_attribute.bionic_id = ?';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/attribute', function(req, res, next) {
        req.table.name = 'bionic';
        req.table.admin = false;
        req.table.user = true;

        req.relation.name = 'attribute';

        rest.relationPostWithValue(req, res, next);
    });

    router.delete(path + '/id/:id/attribute/:id2', function(req, res, next) {
        req.table.name = 'bionic';
        req.table.admin = false;
        req.table.user = true;

        req.relation.name = 'attribute';

        rest.relationDelete(req, res, next);
    });
};