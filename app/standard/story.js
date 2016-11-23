var rest = require('./../rest'),
    hasher = require('./../hasher');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'story.id, ' +
        'story.name, ' +
        'story.description, ' +
        'story.world_id, ' +
        'world.name AS world_name, ' +
        'story.created, ' +
        'story.deleted, ' +
        'story.updated ' +
        'FROM story ' +
        'LEFT JOIN world ON world.id = story.world_id';

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' + table + '.deleted is NULL';
        rest.QUERY(pool, req, res, call);
    });

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/deleted', function(req, res) {
        var call = query + ' WHERE ' + table + '.deleted is NOT NULL';
        rest.QUERY(pool, req, res, call);
    });

    router.get(path + '/all', function(req, res) {
        rest.QUERY(pool, req, res, query);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' + table + '.id = ?';
        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/hash/:id', function(req, res) {
        var call = query + ' WHERE ' + table + '.hash = ?';
        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path, function(req, res) {
        req.body.hash = hasher(24);
        rest.INSERT(pool, req, res, table);
    });

    router.put(path + '/hash/:id', function(req, res) {
        if (req.body.hash) {
            res.status(403).send({header: 'HASH error', message: 'HASH cannot be changed'})
        } else {
            rest.PUT(pool, req, res, table, {where: {hash: req.params.id}});
        }
    });

    router.put(path + '/revive/:id', function(req, res) {
        rest.REVIVE(pool, req, res, table);
    });

    router.delete(path + '/hash/:id', function(req, res) {
        rest.DELETE(pool, req, res, table, {where: {hash: req.params.id}});
    });
};