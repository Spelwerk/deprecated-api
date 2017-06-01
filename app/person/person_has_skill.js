var async = require('async'),
    rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT ' +
        'skill.id, ' +
        'skill.canon, ' +
        'skill.special, ' +
        'skill.name, ' +
        'skill.description, ' +
        'skill.icon' +
        'person_has_skill.value, ' +
        'FROM person_has_skill ' +
        'LEFT JOIN skill ON skill.id = person_has_skill.skill_id';

    router.get(path + '/id/:id/skill', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_has_skill.person_id = ?';

        rest.QUERY(req, res, next, call, [req.params.id], {"name": "ASC"});
    });

    router.post(path + '/id/:id/skill', function(req, res, next) {
        rest.relationPostWithValue(req, res, next, 'person', req.params.id, 'skill', req.body.insert_id, req.body.value);
    });

    router.put(path + '/id/:id/skill', function(req, res, next) {
        var person = {},
            insert = {},
            current = {};

        person.id = req.params.id;
        insert.id = parseInt(req.body.insert_id);
        insert.value = parseInt(req.body.value);

        async.series([
            function(callback) {
                rest.userAuth(req, false, 'skill', req.params.id, callback);
            },
            function(callback) {
                rest.query('SELECT value FROM person_has_skill WHERE person_id = ? AND skill_id = ?', [person.id, insert.id], function(err, result) {
                    current.value = !!result[0] ? parseInt(result[0].value) : 0;

                    insert.value = insert.value + current.value;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('INSERT INTO person_has_skill (person_id,skill_id,value) VALUES (?,?,?) ON DUPLICATE KEY UPDATE value = VALUES(value)', [person.id, insert.id, insert.value], callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });
};