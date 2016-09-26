var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'characteristic.id, ' +
        'characteristic.name, ' +
        'characteristic.description, ' +
        'characteristic.gift, ' +
        'characteristic.species_id, ' +
        'species.name AS species_name, ' +
        'characteristic.manifestation_id, ' +
        'manifestation.name AS manifestation_name, ' +
        'characteristic.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'characteristic.attribute_value, ' +
        'characteristic.created, ' +
        'characteristic.deleted ' +
        'FROM characteristic ' +
        'LEFT JOIN species ON species.id = characteristic.species_id ' +
        'LEFT JOIN manifestation ON manifestation.id = characteristic.manifestation_id ' +
        'LEFT JOIN attribute ON attribute.id = characteristic.attribute_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path, function(req, res) {
        rest.QUERY(pool, req, res, query, null);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE characteristic.id = ?';
        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path, function(req, res) {
        rest.POST(pool, req, res, table);
    });

    router.put(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.put(path + '/id/:id', function(req, res) {
        rest.PUT(pool, req, res, table);
    });

    router.delete(path + '/id/:id', function(req, res) {
        rest.DELETE(pool, req, res, table);
    });
};