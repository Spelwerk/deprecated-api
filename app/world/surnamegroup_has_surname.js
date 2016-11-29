var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'surname.id, ' +
        'surname.name ' +
        'FROM surnamegroup_has_surname ' +
        'LEFT JOIN surname ON surname.id = surnamegroup_has_surname.surname_id';

    require('../default-has')(pool, router, table, path, ["surnamegroup_id","surname_id"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'surnamegroup_has_surname.surnamegroup_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};