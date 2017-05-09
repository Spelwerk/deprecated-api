var async = require('async'),
    rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT ' +
        'expertise.id, ' +
        'expertise.name, ' +
        'expertise.description, ' +
        'expertise.skill_id, ' +
        'person_has_expertise.value AS level, ' +
        'person_has_skill.value AS bonus, ' +
        'skill.icon ' +
        'FROM person_has_expertise ' +
        'LEFT JOIN expertise ON expertise.id = person_has_expertise.expertise_id ' +
        'LEFT JOIN skill ON skill.id = expertise.skill_id ' +
        'LEFT JOIN person_has_skill ON person_has_skill.person_id = ? AND person_has_skill.skill_id = expertise.skill_id';

    router.get(path + '/id/:id/expertise', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_has_expertise.person_id = ?';

        rest.QUERY(req, res, next, call, [req.params.id, req.params.id], {"name": "ASC"}); // Using ? ON person.id IN LEFT JOIN
    });

    router.post(path + '/id/:id/expertise', function(req, res, next) {
        var person = {},
            insert = {},
            doctrine = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = parseInt(req.body.insert_id);
        insert.value = 0;

        if(req.body.value > 0 && req.body.value <= 4) {
            insert.value = req.body.value;
        }

        async.series([
            function(callback) {
                rest.personAuth(person, callback);
            },
            function(callback) {
                rest.query('SELECT doctrine_id FROM expertise WHERE id = ?', [insert.id], function(err, result) {
                    doctrine.id = !!result[0] ? parseInt(result[0].doctrine_id) : null;

                    callback(err);
                });
            },
            function(callback) {
                if(!doctrine.id) return callback();

                rest.query('SELECT value FROM person_has_doctrine WHERE person_id = ? AND doctrine_id = ?', [person.id, doctrine.id], function(err, result) {
                    doctrine.exists = !!result[0];

                    callback(err);
                });
            },
            function(callback) {
                rest.query('INSERT INTO person_has_expertise (person_id,expertise_id,value) VALUES (?,?,?) ON DUPLICATE KEY UPDATE value = VALUES(value)', [person.id, insert.id, insert.value], callback);
            },
            function(callback) {
                if(!doctrine.id || doctrine.exists) return callback();

                rest.query('INSERT INTO person_has_doctrine (person_id,doctrine_id,value) VALUES (?,?,0) ON DUPLICATE KEY UPDATE value = VALUES(value)', [person.id, doctrine.id], callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });

    router.put(path + '/id/:id/expertise/:id2', function(req, res, next) {
        req.table.name = 'expertise';
        req.table.admin = false;
        req.table.user = true;

        rest.personCustomDescription(req, res, next);
    });
};