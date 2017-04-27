var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM world_has_manifestation ' +
        'LEFT JOIN manifestation ON manifestation.id = world_has_manifestation.manifestation_id';

    router.get(path + '/id/:id/manifestation', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_manifestation.world_id = ? AND ' +
            'manifestation.canon = ? AND ' +
            'manifestation.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, 1]);
    });

    /*
        todo add to world on creation:
        todo + expertises on manifestation.expertisetype_id
        todo + attribute(doctrine) manifestation.on attributetype_id
        todo + attribute(power) on manifestation.power_attribute_id
        todo + attribute(skill) on manifestation.skill_attribute_id
        todo + gift on gift.manifestation_id
        todo + imperfection on imperfection.manifestation_id
        todo + milestone on milestone.manifestation_id
    */
    router.post(path + '/id/:id/manifestation', function(req, res) {
        rest.worldPostHas(pool, req, res, req.params.id, 'manifestation');
    });

    router.delete(path + '/id/:id/manifestation/:id2', function(req, res) {
        rest.worldDeleteHas(pool, req, res, req.params.id, req.params.id2, 'manifestation');
    });
};