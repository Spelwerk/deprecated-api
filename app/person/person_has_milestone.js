var async = require('async'),
    rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT ' +
        'milestone.id, ' +
        'milestone.canon, ' +
        'milestone.popularity, ' +
        'milestone.name, ' +
        'milestone.description, ' +
        'milestone.background_id, ' +
        'milestone.species_id, ' +
        'milestone.manifestation_id, ' +
        'person_has_milestone.custom ' +
        'FROM person_has_milestone ' +
        'LEFT JOIN milestone ON milestone.id = person_has_milestone.milestone_id';

    router.get(path + '/id/:id/milestone', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_has_milestone.person_id = ?';

        rest.QUERY(req, res, next, call, [req.params.id], {"name": "ASC"});
    });

    router.post(path + '/id/:id/milestone', function(req, res, next) {
        var person = {},
            insert = {},
            current = {};

        person.id = req.params.id;
        insert.id = parseInt(req.body.insert_id);

        async.series([
            function(callback) {
                rest.userAuth(req, false, 'person', req.params.id, callback);
            },
            function(callback) {
                rest.query('SELECT attribute_id, value FROM person_has_attribute WHERE person_id = ?', [person.id], function(err, result) {
                    person.attribute = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('SELECT attribute_id, value FROM milestone_has_attribute WHERE milestone_id = ?', [insert.id], function(err, result) {
                    insert.attribute = !!result[0] ? result : null;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('SELECT skill_id, value FROM person_has_skill WHERE person_id = ?', [person.id], function(err, result) {
                    person.skill = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('SELECT skill_id, value FROM milestone_has_skill WHERE milestone_id = ?', [insert.id], function(err, result) {
                    insert.skill = !!result[0] ? result : null;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('INSERT INTO person_has_milestone (person_id,milestone_id) VALUES (?,?)', [person.id, insert.id], callback);
            },
            function(callback) {
                rest.personInsertAttribute(person, insert, current, callback);
            },
            function(callback) {
                rest.personInsertSkill(person, insert, current, callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });

    router.put(path + '/id/:id/milestone/:id2', function(req, res, next) {
        rest.personCustomDescription(req, res, next, req.params.id, 'milestone', req.params.id2, req.body.custom);
    });

    router.delete(path + '/id/:id/milestone/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'person', req.params.id, 'milestone', req.params.id2);
    });
};