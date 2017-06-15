var async = require('async'),
    rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT ' +
        'disease.id, ' +
        'disease.canon, ' +
        'disease.popularity, ' +
        'disease.name, ' +
        'person_has_disease.heal, ' +
        'person_has_disease.timestwo ' +
        'FROM person_has_disease ' +
        'LEFT JOIN disease ON disease.id = person_has_disease.disease_id';

    router.get(path + '/id/:id/disease', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_id = ?';

        rest.QUERY(req, res, next, call, [req.params.id], {"heal": "ASC", "name": "ASC"});
    });

    router.post(path + '/id/:id/disease', function(req, res, next) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        insert.name = req.body.name;
        insert.timestwo = req.body.timestwo;

        async.series([
            function(callback) {
                rest.userAuth(req, false, 'disease', req.params.id, callback);
            },
            function(callback) {
                rest.query('INSERT INTO disease (name) VALUES (?)', [insert.name], function(err, result) {
                    insert.id = result.insertId;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('INSERT INTO person_has_disease (person_id,disease_id,timestwo) VALUES (?,?,?)', [person.id, insert.id, insert.timestwo], callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });

    router.put(path + '/id/:id/disease/:id2/heal/:heal', function(req, res, next) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        insert.id = req.params.id2;
        insert.heal = req.params.heal;

        async.series([
            function(callback) {
                rest.userAuth(req, false, 'disease', req.params.id, callback);
            },
            function(callback) {
                rest.query('UPDATE person_has_disease SET heal = ? WHERE person_id = ? AND disease_id = ?', [insert.heal, person.id, insert.id], callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });
};