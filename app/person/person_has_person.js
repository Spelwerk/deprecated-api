var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'person.id, ' +
        'person_has_person.hash, ' +
        'person.nickname, ' +
        'person.firstname, ' +
        'person.surname, ' +
        'person.occupation, ' +
        'person.description, ' +
        'person_has_person.loyalty_id, ' +
        'loyalty.name AS loyalty_name, ' +
        'loyalty.description AS loyalty_description, ' +
        'loyalty.value AS loyalty_value ' +
        'FROM person_has_person ' +
        'LEFT JOIN person ON person.id = person_has_person.person_id_2 ' +
        'LEFT JOIN loyalty ON loyalty.id = person_has_person.loyalty_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_person.person_id_1 = ?';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table, req.body);
    });

    router.put(path, function(req, res) {
        rest.INSERT(pool, req, res, table, req.body);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var call = {
            "person_id_1": req.params.id1,
            "person_id_2": req.params.id2
        };

        rest.REMOVE(pool, req, res, table, call);
    });
};