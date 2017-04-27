var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'expertise.id, ' +
        'expertise.canon, ' +
        'expertise.special, ' +
        'expertise.name, ' +
        'expertise.description, ' +
        'expertise.expertisetype_id, ' +
        'expertisetype.name AS expertisetype_name, ' +
        'expertisetype.maximum, ' +
        'expertisetype.skill_attribute_required, ' +
        'expertisetype.skill_attribute_increment, ' +
        'expertisetype.startsat, ' +
        'expertise.species_id, ' +
        'species.name AS species_name, ' +
        'expertise.manifestation_id, ' +
        'manifestation.name AS manifestation_name, ' +
        'expertise.skill_attribute_id, ' +
        'a1.name AS skill_attribute_name, ' +
        'expertise.give_attribute_id, ' +
        'a2.name AS give_attribute_name, ' +
        'a1.icon_id, ' +
        'icon.path AS icon_path, ' +
        'expertise.created, ' +
        'expertise.deleted, ' +
        'expertise.updated ' +
        'FROM expertise ' +
        'LEFT JOIN expertisetype ON expertisetype.id = expertise.expertisetype_id ' +
        'LEFT JOIN species ON species.id = expertise.species_id ' +
        'LEFT JOIN manifestation ON manifestation.id = expertise.manifestation_id ' +
        'LEFT JOIN attribute a1 ON a1.id = expertise.skill_attribute_id ' +
        'LEFT JOIN attribute a2 ON a2.id = expertise.give_attribute_id ' +
        'LEFT JOIN icon ON icon.id = a1.icon_id';

    require('./../default')(pool, router, table, path, query);

    router.get(path + '/type/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'expertise.expertisetype_id = ? AND ' +
            'expertise.special = ? AND ' +
            'expertise.canon = ? AND ' +
            'expertise.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, 0, 1]);
    });

    router.get(path + '/skill/:id/special', function(req, res) {
        var call = query + ' WHERE ' +
            'expertise.skill_attribute_id = ? AND ' +
            'expertise.special = ? AND ' +
            'expertise.canon = ? AND ' +
            'expertise.manifestation_id IS NULL AND ' +
            'expertise.species_id IS NULL AND ' +
            'expertise.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, 0, 1]);
    });
};