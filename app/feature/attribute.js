var rest = require('./../rest');

module.exports = function(router, tableName, path) {
    path = path || '/' + tableName;

    var query = 'SELECT ' +
        'attribute.id, ' +
        'attribute.canon, ' +
        'attribute.name, ' +
        'attribute.description, ' +
        'attribute.attributetype_id, ' +
        'attributetype.maximum, ' +
        'attribute.icon, ' +
        'attribute.created, ' +
        'attribute.deleted,' +
        'attribute.updated ' +
        'FROM attribute ' +
        'LEFT JOIN attributetype ON attributetype.id = attribute.attributetype_id';

    require('./../default')(router, tableName, query, {admin: false, user: true});

    router.get(path, function(req, res, next) {
        var call = query + ' WHERE ' +
            'attribute.canon = 1 AND ' +
            'attribute.deleted IS NULL';

        rest.QUERY(req, res, next, call);
    });

    router.get(path + '/type/:id', function(req, res, next) {
        var call = query + ' WHERE ' +
            'attribute.canon = 1 AND ' +
            'attribute.attributetype_id = ? AND ' +
            'attribute.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/special/:id', function(req, res, next) {
        var call = query + ' WHERE ' +
            'attribute.canon = 1 AND ' +
            'attributetype.special = ? AND ' +
            'attribute.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });
};