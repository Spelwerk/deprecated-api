var rest = require('./../rest'),
    hasher = require('./../hasher');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'person.id, ' +
        'person.nickname, ' +
        'person.firstname, ' +
        'person.surname, ' +
        'person.age, ' +
        'person.cheated, ' +
        'person.supernatural, ' +
        'person.occupation, ' +
        'person.gender, ' +
        'person.description, ' +
        'person.behaviour, ' +
        'person.appearance, ' +
        'person.features, ' +
        'person.personality, ' +
        'person.template, ' +
        'person.popularity, ' +

        'person.world_id, ' +
        'world.name AS world_name, ' +
        'world.description AS world_description, ' +
        'world.supernatural_name AS world_supernatural_name, ' +
        'world.supernatural_attributetype_id AS world_supernatural_attributetype_id, ' +
        'world.skill_attributetype_id AS world_skill_attributetype_id, ' +

        'person.species_id, ' +
        'species.name AS species_name, ' +
        'species.description AS species_description, ' +
        'i1.path AS species_icon_path, ' +

        'person.caste_id, ' +
        'caste.name AS caste_name, ' +
        'caste.description AS caste_description, ' +
        'a1.name AS caste_attribute_name, ' +
        'i2.path AS caste_icon_path, ' +

        'person.nature_id, ' +
        'nature.name AS nature_name, ' +
        'nature.description AS nature_description, ' +
        'a2.name AS nature_attribute_name, ' +
        'i3.path AS nature_icon_path, ' +

        'person.identity_id, ' +
        'identity.name AS identity_name, ' +
        'identity.description AS identity_description, ' +
        'a3.name AS identity_attribute_name, ' +
        'i4.path AS identity_icon_path, ' +

        'person.manifestation_id, ' +
        'manifestation.name AS manifestation_name, ' +
        'manifestation.description AS manifestation_description, ' +
        'i5.name AS manifestation_icon_path, ' +

        'person.focus_id, ' +
        'focus.name AS focus_name, ' +
        'focus.description AS focus_description, ' +
        'a4.name AS focus_attribute_name, ' +
        'i6.name AS focus_icon_path, ' +

        'person.created, ' +
        'person.deleted ' +

        'FROM person ' +

        'LEFT JOIN world ON world.id = person.world_id ' +
        'LEFT JOIN species ON species.id = person.species_id ' +
        'LEFT JOIN caste ON caste.id = person.caste_id ' +
        'LEFT JOIN nature ON nature.id = person.nature_id ' +
        'LEFT JOIN identity ON identity.id = person.identity_id ' +
        'LEFT JOIN manifestation ON manifestation.id = person.manifestation_id ' +
        'LEFT JOIN focus ON focus.id = person.focus_id ' +
        'LEFT JOIN icon i1 ON i1.id = species.icon_id ' +
        'LEFT JOIN icon i2 ON i2.id = caste.icon_id ' +
        'LEFT JOIN icon i3 ON i3.id = nature.icon_id ' +
        'LEFT JOIN icon i4 ON i4.id = identity.icon_id ' +
        'LEFT JOIN icon i5 ON i5.id = manifestation.icon_id ' +
        'LEFT JOIN icon i6 ON i6.id = focus.icon_id ' +
        'LEFT JOIN attribute a1 ON a1.id = caste.attribute_id ' +
        'LEFT JOIN attribute a2 ON a2.id = nature.attribute_id ' +
        'LEFT JOIN attribute a3 ON a3.id = identity.attribute_id ' +
        'LEFT JOIN attribute a4 ON a4.id = focus.attribute_id';

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' + table + '.deleted is NULL';
        rest.QUERY(pool, req, res, call);
    });

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/deleted', function(req, res) {
        var call = query + ' WHERE ' + table + '.deleted is NOT NULL';
        rest.QUERY(pool, req, res, call);
    });

    router.get(path + '/all', function(req, res) {
        rest.QUERY(pool, req, res, query);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' + table + '.id = ?';
        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/legal', function(req, res) {
        var call = query + ' WHERE person.cheated = \'0\' AND person.deleted is null';
        rest.QUERY(pool, req, res, call);
    });

    router.get(path + '/hash/:id', function(req, res) {
        var call = query + ' WHERE ' + table + '.hash = ?';
        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path, function(req, res) {
        req.body.hash = hasher(20);
        rest.POST(pool, req, res, table);
    });

    router.put(path + '/hash/:id', function(req, res) {
        if (req.body.hash) {
            res.status(403).send({header: 'HASH error', message: 'HASH cannot be changed'})
        } else {
            rest.PUT(pool, req, res, table, {hash: req.params.id});
        }
    });

    router.delete(path + '/hash/:id', function(req, res) {
        rest.DELETE(pool, req, res, table, {hash: req.params.id});
    });
};