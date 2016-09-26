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
        'person.afflicted, ' +
        'person.occupation, ' +
        'person.gender, ' +
        'person.description, ' +
        'person.behaviour, ' +
        'person.appearance, ' +
        'person.features, ' +
        'person.personality, ' +
        'person.template, ' +
        'person.popularity, ' +
        'person.setting_id, ' +
        'setting.name AS setting_name, ' +
        'setting.description AS setting_description, ' +
        'person.species_id, ' +
        'species.name AS species_name, ' +
        'species.description AS species_description, ' +
        'person.caste_id, ' +
        'caste.name AS caste_name, ' +
        'caste.description AS caste_description, ' +
        'person.nature_id, ' +
        'nature.name AS nature_name, ' +
        'nature.description AS nature_description, ' +
        'person.identity_id, ' +
        'identity.name AS identity_name, ' +
        'identity.description AS identity_description, ' +
        'person.manifestation_id, ' +
        'manifestation.name AS manifestation_name, ' +
        'manifestation.description AS manifestation_description, ' +
        'person.focus_id, ' +
        'focus.name AS focus_name, ' +
        'focus.description AS focus_description, ' +
        'person.created, ' +
        'person.deleted ' +
        'FROM person ' +
        'LEFT JOIN setting ON setting.id = person.setting_id ' +
        'LEFT JOIN species ON species.id = person.species_id ' +
        'LEFT JOIN caste ON caste.id = person.caste_id ' +
        'LEFT JOIN nature ON nature.id = person.nature_id ' +
        'LEFT JOIN identity ON identity.id = person.identity_id ' +
        'LEFT JOIN manifestation ON manifestation.id = person.manifestation_id ' +
        'LEFT JOIN focus ON focus.id = person.focus_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path, function(req, res) {
        var call = query + ' WHERE person.cheated = \'0\' AND person.deleted is null';
        rest.QUERY(pool, req, res, call, null);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE person.id = ?';
        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/hash/:id', function(req, res) {
        var call = query + ' WHERE person.hash = ?';
        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path, function(req, res) {
        req.body.hash = hasher(20);
        rest.POST(pool, req, res, table);
    });

    router.put(path + '/hash/:id', function(req, res) {
        if (req.body.hash) {
            res.status(403).send({error: 'hash cannot be changed'})
        } else {
            rest.PUT(pool, req, res, table, req.body, 'hash');
        }
    });

    router.delete(path + '/hash/:id', function(req, res) {
        rest.DELETE(pool, req, res, table, {hash: req.params.id});
    });
};