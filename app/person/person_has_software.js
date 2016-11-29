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
        'FROM person_has_software ' +
        'LEFT JOIN software ON software.id = person_has_software.software_id';

    require('../default-has')(pool, router, table, path, ["person_id","software_id"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_software.person_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};