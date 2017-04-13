var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = ''; // todo build new select

    require('../default-has')(pool, router, table, path, ["person_id_1","person_id_2"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_person.person_id_1 = ?';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};