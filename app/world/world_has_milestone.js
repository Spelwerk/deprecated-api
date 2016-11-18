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
        'milestone.created, ' +
        'milestone.deleted ' +
        'FROM world_has_milestone ' +
        'LEFT JOIN milestone ON milestone.id = world_has_milestone.milestone_id ' +
        'LEFT JOIN caste ON caste.id = milestone.caste_id ' +
        'LEFT JOIN manifestation ON manifestation.id = milestone.manifestation_id ' +
        'LEFT JOIN attribute ON attribute.id = milestone.attribute_id ' +
        'LEFT JOIN loyalty ON loyalty.id = milestone.loyalty_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_milestone.world_id = ? AND ' +
            'milestone.deleted is null';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/id/:id1/upbringing/:id2/caste/:id3/manifestation/:id4', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_milestone.world_id = ? AND ' +
            'milestone.upbringing = ? AND ' +
            'milestone.caste_id = ? AND ' +
            '(milestone.manifestation_id = ? OR milestone.manifestation_id is null) AND ' +
            'milestone.deleted is null';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2, req.params.id3, req.params.id4]);
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var call = {
            "world_id": req.params.id1,
            "milestone_id": req.params.id2
        };

        rest.REMOVE(pool, req, res, table, call);
    });
};