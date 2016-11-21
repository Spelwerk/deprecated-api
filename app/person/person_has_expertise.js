var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'expertise.id, ' +
        'expertise.name, ' +
        'person_has_expertise.level, ' +
        'expertise.description, ' +
        'expertise.hidden, ' +
        'expertisetype.maximum, ' +
        'expertise.expertisetype_id, ' +
        'expertisetype.name AS expertisetype_name, ' +
        'expertise.skill_attribute_id, ' +
        'a1.name AS skill_attribute_name, ' +
        'expertise.give_attribute_id, ' +
        'a2.name AS give_attribute_name, ' +
        'icon.path AS icon_path ' +
        'FROM person_has_expertise ' +
        'LEFT JOIN expertise ON expertise.id = person_has_expertise.expertise_id ' +
        'LEFT JOIN expertisetype ON expertisetype.id = expertise.expertisetype_id ' +
        'LEFT JOIN species ON species.id = expertise.species_id ' +
        'LEFT JOIN manifestation ON manifestation.id = expertise.manifestation_id ' +
        'LEFT JOIN attribute a1 ON a1.id = expertise.skill_attribute_id ' +
        'LEFT JOIN attribute a2 ON a2.id = expertise.give_attribute_id ' +
        'LEFT JOIN icon ON icon.id = a1.icon_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/id/:id1/type/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_expertise.person_id = ? AND ' +
            'expertise.expertisetype_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id1,req.params.id2]);
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.put(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var where = {
            "person_id": req.params.id1,
            "expertise_id": req.params.id2
        };

        rest.DELETE(pool, req, res, table, {where: where, timestamp: false});
    });
};