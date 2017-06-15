var async = require('async'),
    rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT ' +
        'expertise.id, ' +
        'expertise.canon, ' +
        'expertise.popularity, ' +
        'expertise.name, ' +
        'expertise.description, ' +
        'expertise.skill_id, ' +
        'expertise.species_id, ' +
        'expertise.manifestation_id, ' +
        'skill.icon, ' +
        'person_has_expertise.value, ' +
        'person_has_skill.value AS bonus ' +
        'FROM person_has_expertise ' +
        'LEFT JOIN expertise ON expertise.id = person_has_expertise.expertise_id ' +
        'LEFT JOIN skill ON skill.id = expertise.skill_id ' +
        'LEFT JOIN person_has_skill ON person_has_skill.person_id = ? AND person_has_skill.skill_id = expertise.skill_id';

    router.get(path + '/id/:id/expertise', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_has_expertise.person_id = ?';

        rest.QUERY(req, res, next, call, [req.params.id, req.params.id], {"name": "ASC"}); // Using ? ON person.id IN LEFT JOIN
    });

    router.get(path + '/id/:id/expertise/manifestation/:id2', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_has_expertise.person_id = ? AND ' +
            'expertise.manifestation_id = ?';

        rest.QUERY(req, res, next, call, [req.params.id, req.params.id, req.params.id2], {"name": "ASC"}); // Using ? ON person.id IN LEFT JOIN
    });

    router.post(path + '/id/:id/expertise', function(req, res, next) {
        rest.relationPostWithValue(req, res, next, 'person', req.params.id, 'expertise', req.body.insert_id, req.body.value);
    });

    router.put(path + '/id/:id/expertise', function(req, res, next) {
        var person = {},
            insert = {},
            current = {};

        person.id = req.params.id;
        insert.id = parseInt(req.body.insert_id);
        insert.value = parseInt(req.body.value);

        async.series([
            function(callback) {
                rest.userAuth(req, false, 'expertise', req.params.id, callback);
            },
            function(callback) {
                rest.query('SELECT value FROM person_has_expertise WHERE person_id = ? AND expertise_id = ?', [person.id, insert.id], function(err, result) {
                    current.value = !!result[0] ? parseInt(result[0].value) : 0;

                    insert.value = insert.value + current.value;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('INSERT INTO person_has_expertise (person_id,expertise_id,value) VALUES (?,?,?) ON DUPLICATE KEY UPDATE value = VALUES(value)', [person.id, insert.id, insert.value], callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });

    router.put(path + '/id/:id/expertise/:id2', function(req, res, next) {
        rest.personCustomDescription(req, res, next, req.params.id, 'expertise', req.params.id2, req.body.custom);
    });
};