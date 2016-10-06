var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var publicQuery = 'SELECT ' +
        'user.id, ' +
        'user.username, ' +
        'user.email, ' +
        'user.created, ' +
        'user.deleted ' +
        'FROM user';

    router.get(path, function(req, res) {
        rest.QUERY(pool, req, res, publicQuery, null);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = publicQuery + ' WHERE user.id = ?';
        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/info', function(req, res) {
        rest.USERINFO(req, res);
    });

    router.post(path + '/create', function(req, res) {
        rest.USERADD(pool, req, res);
    });

    router.post(path + '/auth', function(req, res) {
        rest.USERAUTH(pool, req, res);
    });

    router.post(path + '/promote/:id', function(req, res) {
        rest.USERPROMOTE(pool, req, res);
    });

    router.post(path + '/demote/:id', function(req, res) {
        rest.USERDEMOTE(pool, req, res);
    });

    router.delete(path + '/id/:id', function(req, res) {
        rest.DELETE(pool, req, res, table);
    });
};