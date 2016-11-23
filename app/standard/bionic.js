var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'bionic.id, ' +
        'bionic.name, ' +
        'bionic.description, ' +
        'bionic.price, ' +
        'bionic.energy, ' +
        'bionic.legal, ' +
        'bionic.bodypart_id, ' +
        'bodypart.name AS bodypart_name, ' +
        'bionic.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'bionic.attribute_value, ' +
        'bionic.icon_id, ' +
        'icon.path AS icon_path, ' +
        'bionic.created, ' +
        'bionic.deleted, ' +
        'bionic.updated ' +
        'FROM bionic ' +
        'LEFT JOIN bodypart ON bodypart.id = bionic.bodypart_id ' +
        'LEFT JOIN attribute ON attribute.id = bionic.attribute_id ' +
        'LEFT JOIN icon ON icon.id = bionic.icon_id';

    require('./../default')(pool, router, table, path, query);

    router.get(path + '/bodypart/:id', function(req, res) {
        var call = query + ' WHERE ' +
            table + '.bodypart_id = ? AND ' +
            table + '.deleted is NOT NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};