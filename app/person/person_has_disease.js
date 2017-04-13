var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'disease.id, ' +
        'disease.canon, ' +
        'disease.name, ' +
        'person_has_disease.heal, ' +
        'person_has_disease.timestwo ' +
        'FROM person_has_disease ' +
        'LEFT JOIN disease ON disease.id = person_has_disease.disease_id';

    require('../default-has')(pool, router, table, path, ["person_id","disease_id"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'person_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"heal": "ASC", "name": "ASC"});
    });

    router.put(path + '/id/:id1/id/:id2', function(req, res) {
        rest.PUT(pool, req, res, table, {"person_id": req.params.id1, "disease_id": req.params.id2});
    });
};