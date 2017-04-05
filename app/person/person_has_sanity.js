var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'person_has_sanity.sanity_id AS id, ' +
        'sanity.name, ' +
        'person_has_sanity.heal, ' +
        'person_has_sanity.timestwo ' +
        'FROM person_has_sanity ' +
        'LEFT JOIN sanity ON sanity.id = person_has_sanity.sanity_id';

    require('../default-has')(pool, router, table, path, ["person_id","sanity_id"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'person_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"heal": "ASC", "name": "ASC"});
    });

    router.put(path + '/id/:id1/id/:id2', function(req, res) {
        rest.PUT(pool, req, res, table, {"person_id": req.params.id1, "sanity_id": req.params.id2});
    });
};