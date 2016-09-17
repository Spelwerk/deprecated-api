var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'relationship.id, ' +
        'relationship.name, ' +
        'relationship.description, ' +
        'relationship.occupation, ' +
        'relationship.finance, ' +
        'relationship.popularity, ' +
        'relationship.created, ' +
        'relationship.deleted, ' +
        'relationship.setting_id, ' +
        'setting.name AS setting_name ' +
        'FROM relationship ' +
        'LEFT JOIN setting ON setting.id = relationship.setting_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path, function(req, res) {
        rest.QUERY(pool, req, res, query, null);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE relationship.id = ?';
        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path, function(req, res) {
        rest.POST(pool, req, res, table, req.body);
    });

    router.put(path, function(req, res) {
        rest.INSERT(pool, req, res, table, req.body);
    });

    router.put(path + '/id/:id', function(req, res) {
        rest.PUT(pool, req, res, table, req.body, 'id');
    });

    router.delete(path + '/id/:id', function(req, res) {
        rest.DELETE(pool, req, res, table, 'id');
    });
};