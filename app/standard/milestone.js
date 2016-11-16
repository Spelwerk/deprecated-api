var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'milestone.id, ' +
        'milestone.name, ' +
        'milestone.description, ' +
        'milestone.upbringing, ' +
        'milestone.caste_id, ' +
        'caste.name AS caste_name, ' +
        'milestone.manifestation_id, ' +
        'manifestation.name AS manifestation_name, ' +
        'milestone.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'milestone.attribute_value, ' +
        'milestone.loyalty_id, ' +
        'loyalty.name AS loyalty_name, ' +
        'caste.icon_id, ' +
        'icon.path AS icon_path, ' +
        'milestone.created, ' +
        'milestone.deleted ' +
        'FROM milestone ' +
        'LEFT JOIN caste ON caste.id = milestone.caste_id ' +
        'LEFT JOIN manifestation ON manifestation.id = milestone.manifestation_id ' +
        'LEFT JOIN attribute ON attribute.id = milestone.attribute_id ' +
        'LEFT JOIN loyalty ON loyalty.id = milestone.loyalty_id ' +
        'LEFT JOIN icon ON icon.id = caste.icon_id';

    require('./../default')(pool, router, table, path, query);

    router.get(path + '/upbringing/:id1/caste/:id2/manifestation/:id3', function(req, res) {
        var call = query + ' WHERE ' +
            'milestone.upbringing = ? AND ' +
            'milestone.caste_id = ? AND ' +
            '(milestone.manifestation_id = ? OR milestone.manifestation_id is NULL) AND ' +
            'milestone.deleted is NOT NULL';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2, req.params.id3]);
    });
};