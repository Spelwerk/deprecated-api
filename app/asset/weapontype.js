var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM weapontype';

    var allowedPost = ['name', 'damage_d12', 'damage_bonus', 'critical_d12', 'hand', 'initiative', 'hit', 'distance', 'weapongroup_id'];

    var allowedPut = ['name', 'damage_d12', 'damage_bonus', 'critical_d12', 'hand', 'initiative', 'hit', 'distance', 'weapongroup_id'];

    var allowsUser = true;

    require('./../default-protected')(pool, router, table, path, query, allowedPost, allowedPut, allowsUser);

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/group/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'weapongroup_id = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};