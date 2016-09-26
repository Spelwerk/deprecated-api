var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'attribute.id, ' +
        'attribute.name, ' +
        'attribute.description, ' +
        'attribute.protected, ' +
        'attribute.roll, ' +
        'attributetype.maximum, ' +
        'attribute.attributetype_id, ' +
        'attributetype.name AS attributetype_name, ' +
        'attribute.manifestation_id, ' +
        'manifestation.name AS manifestation_name, ' +
        'attribute.created, ' +
        'attribute.deleted ' +
        'FROM setting_has_attribute ' +
        'LEFT JOIN attribute ON attribute.id = setting_has_attribute.attribute_id ' +
        'LEFT JOIN attributetype ON attributetype.id = attribute.attributetype_id ' +
        'LEFT JOIN manifestation ON manifestation.id = attribute.manifestation_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'setting_has_attribute.setting_id = ? AND ' +
            'attribute.deleted is null';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/id/:id1/type/:id2/manifestation/:id3', function(req, res) {
        var call = query + ' WHERE ' +
            'setting_has_attribute.setting_id = ? AND ' +
            'attribute.attributetype_id = ? AND ' +
            'attribute.manifestation_id = ? AND ' +
            'attribute.deleted is null';

        rest.QUERY(pool, req, res, call, [req.params.id1,req.params.id2,req.params.id3]);
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var call = {
            "setting_id": req.params.id1,
            "attribute_id": req.params.id2
        };

        rest.REMOVE(pool, req, res, table, call);
    });
};