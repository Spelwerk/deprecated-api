var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'person_has_wound.wound_id AS id, ' +
        'wound.name, ' +
        'person_has_wound.aid, ' +
        'person_has_wound.heal, ' +
        'person_has_wound.lethal ' +
        'FROM person_has_wound ' +
        'LEFT JOIN wound ON wound.id = person_has_wound.wound_id';

    require('../default-has')(pool, router, table, path, ["person_id","wound_id"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'person_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"heal": "ASC", "name": "ASC"});
    });

    router.get(path + '/id/:id1/lethal/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'person_id = ? AND ' +
            'lethal = ?';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2], {"heal": "DESC", "aid": "DESC", "name": "ASC"});
    });

    router.put(path + '/id/:id1/id/:id2', function(req, res) {
        rest.PUT(pool, req, res, table, {"person_id": req.params.id1, "wound_id": req.params.id2});
    });
};