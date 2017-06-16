var async = require('async'),
    rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM person_has_gift ' +
        'LEFT JOIN gift ON gift.id = person_has_gift.gift_id';

    router.get(path + '/id/:id/gift', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_has_gift.person_id = ?';

        rest.QUERY(req, res, next, call, [req.params.id], {"name": "ASC"});
    });

    router.post(path + '/id/:id/gift', function(req, res, next) {
        var person = {},
            current = {},
            insert = {};

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
                rest.query('SELECT attribute_id, value FROM gift_has_attribute WHERE gift_id = ?', [insert.id], function(err, result) {
                    insert.attribute = result;

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
                rest.query('SELECT skill_id, value FROM gift_has_skill WHERE gift_id = ?', [insert.id], function(err, result) {
                    insert.skill = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('INSERT INTO person_has_gift (person_id,gift_id) VALUES (?,?)', [person.id, insert.id], callback);
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

    router.put(path + '/id/:id/gift/:id2', function(req, res, next) {
        rest.personCustomDescription(req, res, next, req.params.id, 'gift', req.params.id2, req.body.custom);
    });

    router.delete(path + '/id/:id/gift/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'person', req.params.id, 'gift', req.params.id2);
    });
};