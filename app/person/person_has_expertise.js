var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'expertise.id, ' +
        'expertise.canon, ' +
        'expertise.special, ' +
        'expertise.name, ' +
        'expertise.description, ' +
        'person_has_expertise.expertise_custom, ' +
        'person_has_expertise.level, ' +
        'expertise.expertisetype_id, ' +
        'expertisetype.name AS expertisetype_name, ' +
        'expertisetype.maximum, ' +
        'expertisetype.skill_attribute_required, ' +
        'expertisetype.skill_attribute_increment, ' +
        'expertisetype.startsat, ' +
        'person_has_attribute.value AS skill_attribute_value, ' +
        'expertise.species_id, ' +
        'expertise.manifestation_id, ' +
        'expertise.skill_attribute_id, ' +
        'a1.name AS skill_attribute_name, ' +
        'expertise.give_attribute_id, ' +
        'a2.name AS give_attribute_name, ' +
        'icon.path AS icon_path ' +
        'FROM person_has_expertise ' +
        'LEFT JOIN expertise ON expertise.id = person_has_expertise.expertise_id ' +
        'LEFT JOIN expertisetype ON expertisetype.id = expertise.expertisetype_id ' +
        'LEFT JOIN attribute a1 ON a1.id = expertise.skill_attribute_id ' +
        'LEFT JOIN attribute a2 ON a2.id = expertise.give_attribute_id ' +
        'LEFT JOIN person_has_attribute ON person_has_attribute.person_id = ? AND person_has_attribute.attribute_id = expertise.skill_attribute_id ' +
        'LEFT JOIN icon ON icon.id = a1.icon_id';

    require('../default-has')(pool, router, table, path, ["person_id","expertise_id"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_expertise.person_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id]); // Using ? ON id IN LEFT JOIN
    });

    router.get(path + '/id/:id1/expertise/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_expertise.person_id = ? AND ' +
            'person_has_expertise.expertise_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id1, req.params.id2]); // Using ? ON id1 IN LEFT JOIN
    });

    router.get(path + '/id/:id1/type/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_expertise.person_id = ? AND ' +
            'expertise.expertisetype_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id1, req.params.id2]); // Using ? ON id1 IN LEFT JOIN
    });
};