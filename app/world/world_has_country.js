var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'country.id, ' +
        'country.name, ' +
        'country.description, ' +
        'country.language_id, ' +
        'language.name AS language_name, ' +
        'language.firstnamegroup_id, ' +
        'language.surnamegroup_id ' +
        'FROM world_has_country ' +
        'LEFT JOIN country ON country.id = world_has_country.country_id';

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_country.world_id = ? AND ' +
            'country.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    require('../default-has')(pool, router, table, query, path, ["world_id","country_id"]);
};