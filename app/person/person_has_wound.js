var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'wound.id, ' +
        'wound.name, ' +
        'wound.lethal, ' +
        'person_has_wound.aid, ' +
        'person_has_wound.heal ' +
        'FROM person_has_wound ' +
        'LEFT JOIN wound ON wound.id = person_has_wound.wound_id';

    require('../default-has')(pool, router, table, path, ["person_id","wound_id"]);

    router.get(path + '/id/:id1/heal/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_wound.person_id = ? AND ' +
            'person_has_wound.heal = ?';

        rest.QUERY(pool, req, res, call, [req.params.id1,req.params.id2], {"aid": "ASC", "lethal": "DESC", "name": "ASC"});
    });
};