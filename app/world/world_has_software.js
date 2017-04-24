var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'software.id, ' +
        'software.canon, ' +
        'software.name, ' +
        'software.description, ' +
        'software.price, ' +
        'software.hacking, ' +
        'software.hacking_bonus, ' +
        'software.legal ' +
        'FROM world_has_software ' +
        'LEFT JOIN software ON software.id = world_has_software.software_id';

    router.get(path + '/id/:id/software', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_software.world_id = ? AND ' +
            'software.canon = ? AND ' +
            'software.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, 1]);
    });

    router.post(path + '/id/:id/software', function(req, res) {
        rest.worldPostHas(pool, req, res, req.params.id, 'software');
    });

    router.delete(path + '/id/:id/software/:id2', function(req, res) {
        rest.worldDeleteHas(pool, req, res, req.params.id, req.params.id2, 'software');
    });
};