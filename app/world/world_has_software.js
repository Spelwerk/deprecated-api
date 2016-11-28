var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'software.id, ' +
        'software.name, ' +
        'software.description, ' +
        'software.price, ' +
        'software.hacking, ' +
        'software.hacking_bonus, ' +
        'software.legal ' +
        'FROM world_has_software ' +
        'LEFT JOIN software ON software.id = world_has_software.software_id';

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_software.world_id = ? AND ' +
            'software.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    require('../default-has')(pool, router, table, query, path, ["world_id","software_id"]);
};