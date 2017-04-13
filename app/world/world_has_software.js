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

    require('../default-has')(pool, router, table, path, ["world_id","software_id"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_software.world_id = ? AND ' +
            'software.canon = ? AND ' +
            'software.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, 1]);
    });
};