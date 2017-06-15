var async = require('async'),
    rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT ' +
        'sanity.id, ' +
        'sanity.canon, ' +
        'sanity.popularity, ' +
        'sanity.name, ' +
        'person_has_sanity.heal, ' +
        'person_has_sanity.timestwo ' +
        'FROM person_has_sanity ' +
        'LEFT JOIN sanity ON sanity.id = person_has_sanity.sanity_id';

    router.get(path + '/id/:id/sanity', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_id = ?';

        rest.QUERY(req, res, next, call, [req.params.id], {"heal": "ASC", "name": "ASC"});
    });

    router.post(path + '/id/:id/sanity', function(req, res, next) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        insert.name = req.body.name;
        insert.timestwo = req.body.timestwo;

        async.series([
            function(callback) {
                rest.userAuth(req, false, 'sanity', req.params.id, callback);
            },
            function(callback) {
                rest.query('INSERT INTO sanity (name) VALUES (?)', [insert.name], function(err, result) {
                    insert.id = result.insertId;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('INSERT INTO person_has_sanity (person_id,sanity_id,timestwo) VALUES (?,?,?)', [person.id, insert.id, insert.timestwo], callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });

    router.put(path + '/id/:id/sanity/:id2/heal/:heal', function(req, res, next) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        insert.id = req.params.id2;
        insert.heal = req.params.heal;

        async.series([
            function(callback) {
                rest.userAuth(req, false, 'sanity', req.params.id, callback);
            },
            function(callback) {
                rest.query('UPDATE person_has_sanity SET heal = ? WHERE person_id = ? AND sanity_id = ?', [insert.heal, person.id, insert.id], callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });
};