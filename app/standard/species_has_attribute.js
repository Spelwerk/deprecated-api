var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'species.id AS species_id, ' +
        'species.name AS species_name, ' +
        'attribute.id AS attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'species_has_attribute.value ' +
        'FROM species_has_attribute ' +
        'LEFT JOIN species ON species.id = species_has_attribute.species_id ' +
        'LEFT JOIN attribute ON attribute.id = species_has_attribute.attribute_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path, function(req, res) {
        var call = query + ' WHERE attribute.deleted is null';
        rest.QUERY(pool, req, res, call, null);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE species_has_attribute.species_id = ?';
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
            "species_id": req.params.id1,
            "attribute_id": req.params.id2
        };
        rest.REMOVE(pool, req, res, table, call);
    });
};