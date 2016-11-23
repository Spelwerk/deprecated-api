var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'expertise.id, ' +
        'expertise.name, ' +
        'expertise.description, ' +
        'expertise.hidden, ' +
        'expertise.expertisetype_id, ' +
        'expertisetype.name AS expertisetype_name, ' +
        'expertisetype.maximum, ' +
        'expertisetype.skill_attribute_required, ' +
        'expertisetype.skill_attribute_increment, ' +
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

    router.get(path + '/skill/:id2/type/:id3/species/:id4/manifestation/:id5', function(req, res) {
        var call = query + ' WHERE ' +
            'expertise.skill_attribute_id = ? AND ' +
            'expertise.expertisetype_id = ? AND ' +
            '(expertise.species_id = ? OR expertise.species_id is NULL) AND ' +
            '(expertise.manifestation_id = ? OR expertise.manifestation_id is NULL) AND ' +
            'expertise.deleted is NOT NULL';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2, req.params.id3, req.params.id4]);
    });
};