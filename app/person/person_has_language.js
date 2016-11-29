var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'language.id, ' +
        'language.name, ' +
        'language.description, ' +
        'person_has_language.native ' +
        'FROM person_has_language ' +
        'LEFT JOIN language ON language.id = person_has_language.language_id';

    require('../default-has')(pool, router, table, path, ["person_id","language_id"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_language.person_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"native": "DESC", "name": "ASC"});
    });
};