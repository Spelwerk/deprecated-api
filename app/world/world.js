var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'world.name, ' +
        'world.hash, ' +
        'world.description, ' +
        'world.popularity, ' +
        'world.template, ' +
        'world.bionic, ' +
        'world.augmentation, ' +
        'world.software, ' +
        'world.supernatural, ' +
        'world.supernatural_name, ' +
        'world.skill_attributetype_id, ' +
        'world.attribute_expertisetype_id, ' +
        'world.roll_expertisetype_id, ' +
        'world.split_supernatural, ' +
        'world.split_skill, ' +
        'world.split_expertise, ' +
        'world.split_milestone, ' +
        'world.split_relationship, ' +
        'world.split_timeline, ' +
        'world.max_characteristic, ' +
        'world.max_supernatural, ' +
        'world.max_skill, ' +
        'world.max_expertise, ' +
        'world.max_milestone, ' +
        'world.max_relationship, ' +
        'world.max_timeline_upbringing, ' +
        'world.max_timeline_flexible, ' +
        'world.created, ' +
        'world.deleted,' +
        'world.updated ' +
        'FROM world';

    router.get(path, function(req, res) {
        var call = query + ' WHERE deleted is NULL';

        rest.QUERY(pool, req, res, call);
    });

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/deleted', function(req, res) {
        var call = query + ' WHERE deleted is NOT NULL';

        rest.QUERY(pool, req, res, call);
    });

    router.get(path + '/all', function(req, res) {
        rest.QUERY(pool, req, res, query);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE id = ?';

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