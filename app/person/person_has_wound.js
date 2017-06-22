var async = require('async'),
    rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT ' +
        'wound.canon, ' +
        'wound.popularity, ' +
        'wound.name, ' +
        'person_has_wound.id, ' +
        'person_has_wound.heal, ' +
        'person_has_wound.timestwo, ' +
        'FROM person_has_wound ' +
        'LEFT JOIN wound ON wound.id = person_has_wound.wound_id';

    router.get(path + '/id/:id/wound', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_id = ?';

        rest.GET(req, res, next, call, [req.params.id], {"heal": "ASC", "name": "ASC"});
    });

    router.post(path + '/id/:id/wound', function(req, res, next) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        insert.name = req.body.name;
        insert.timestwo = req.body.timestwo;

        async.series([
            function(callback) {
                rest.userAuth(req, false, 'wound', req.params.id, callback);
            },
            function(callback) {
                rest.query('SELECT id FROM wound WHERE UPPER(name) = ?', [insert.name.toUpperCase()], function(err, result) {
                    if(!result[0]) callback(err);

                    insert.id = result[0].id;

                    callback(err);
                });
            },
            function(callback) {
                if(insert.id) return callback();

                rest.query('INSERT INTO wound (name) VALUES (?)', [insert.name], function(err, result) {
                    insert.id = result.insertId;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('INSERT INTO person_has_wound (person_id,wound_id,timestwo) VALUES (?,?,?)', [person.id, insert.id, insert.timestwo], callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });

    router.put(path + '/id/:id/wound/:id2/heal/:heal', function(req, res, next) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        insert.id = req.params.id2;
        insert.heal = req.params.heal;

        async.series([
            function(callback) {
                rest.userAuth(req, false, 'wound', req.params.id, callback);
            },
            function(callback) {
                rest.query('UPDATE person_has_wound SET heal = ? WHERE id = ?', [insert.heal, person.id, insert.id], callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });
};