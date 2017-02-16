var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'milestone.id, ' +
        'milestone.name, ' +
        'milestone.description, ' +
        'milestone.upbringing, ' +
        'milestone.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'milestone.attribute_value, ' +
        'milestone.loyalty_id, ' +
        'loyalty.name AS loyalty_name, ' +
        'milestone.loyalty_occupation ' +
        'FROM person_has_milestone ' +
        'LEFT JOIN milestone ON milestone.id = person_has_milestone.milestone_id ' +
        'LEFT JOIN attribute ON attribute.id = milestone.attribute_id ' +
        'LEFT JOIN loyalty ON loyalty.id = milestone.loyalty_id';

    require('../default-has')(pool, router, table, path, ["person_id","milestone_id"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_milestone.person_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"name": "ASC"});
    });

    router.get(path + '/id/:id1/upbringing/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_milestone.person_id = ? AND ' +
            'milestone.upbringing = ?';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2], {"name": "ASC"});
    });
};