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
        'loyalty.value AS loyalty_value, ' +
        'icon.path AS icon_path ' +
        'FROM person_has_person ' +
        'LEFT JOIN person ON person.id = person_has_person.person_id_2 ' +
        'LEFT JOIN loyalty ON loyalty.id = person_has_person.loyalty_id ' +
        'LEFT JOIN icon ON icon.id = loyalty.icon_id';

    require('../default-has')(pool, router, table, path, ["person_id_1","person_id_2"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_person.person_id_1 = ?';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};