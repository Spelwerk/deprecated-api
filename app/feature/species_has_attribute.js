var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM species_has_attribute';

    require('../default-has')(pool, router, table, path, ["species_id","attribute_id"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'species_has_attribute.species_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"attribute_id": "ASC"});
    });
};