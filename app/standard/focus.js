var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'focus.id, ' +
        'focus.name, ' +
        'focus.description, ' +
        'focus.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'focus.manifestation_id, ' +
        'manifestation.name AS manifestation_name, ' +
        'focus.created, ' +
        'focus.deleted ' +
        'FROM focus ' +
        'LEFT JOIN attribute ON attribute.id = focus.attribute_id ' +
        'LEFT JOIN manifestation ON manifestation.id = focus.manifestation_id';

    require('./../default')(pool, router, table, path, query);

    router.get(path + '/manifestation/:id', function(req, res) {
        var call = query + ' WHERE ' +
            '(focus.manifestation_id = ? OR focus.manifestation is NULL) AND ' +
            'focus.deleted is NOT NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};