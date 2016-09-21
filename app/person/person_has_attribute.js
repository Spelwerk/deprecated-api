var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'attribute.id, ' +
        'attribute.name, ' +
        'person_has_attribute.value, ' +
        'attribute.description, ' +
        'attribute.protected, ' +
        'attributetype.maximum, ' +
        'attribute.attributetype_id, ' +
        'attributetype.name AS attributetype_name, ' +
        'attribute.manifestation_id, ' +
        'manifestation.name AS manifestation_name ' +
        'FROM person_has_attribute ' +
        'LEFT JOIN attribute ON attribute.id = person_has_attribute.attribute_id ' +
        'LEFT JOIN attributetype ON attributetype.id = attribute.attributetype_id ' +
        'LEFT JOIN manifestation ON manifestation.id = attribute.manifestation_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/id/:id1/type/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_attribute.person_id = ? AND ' +
            'attribute.attributetype_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id1,req.params.id2]);
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table, req.body);
    });

    router.put(path, function(req, res) {
        rest.INSERT(pool, req, res, table, req.body);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var call = {
            "person_id": req.params.id1,
            "attribute_id": req.params.id2
        };

        rest.REMOVE(pool, req, res, table, call);
    });
};