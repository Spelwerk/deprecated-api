var rest = require('./../rest');

module.exports = function(router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM weapongroup';

    var allowedPost = ['name', 'skill_id', 'expertise_id', 'damage_id', 'icon'];

    var allowedPut = ['name', 'skill_id', 'expertise_id', 'damage_id', 'icon'];

    var allowsUser = true;

    require('./../default-protected')(router, table, path, query, allowedPost, allowedPut, allowsUser);

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, call, [req.params.id]);
    });

    router.get(path + '/damage/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'damage_id = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, call, [req.params.id]);
    });

    router.get(path + '/skill/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'skill_id = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, call, [req.params.id]);
    });

    router.get(path + '/special/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'special = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, call, [req.params.id]);
    });
};