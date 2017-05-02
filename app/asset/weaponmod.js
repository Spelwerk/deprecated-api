var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM weaponmod';

    var allowedPost = ['name', 'description', 'short', 'price', 'damage_d12', 'damage_bonus', 'critical_d12', 'initiative', 'hit', 'distance', 'weapontype_id'];

    var allowedPut = ['name', 'description', 'price', 'damage_d12', 'damage_bonus', 'critical_d12', 'initiative', 'hit', 'distance'];

    var allowsUser = true;

    require('./../default-protected')(pool, router, table, path, query, allowedPost, allowedPut, allowsUser);

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/type/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'weapontype_id = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};