var async = require('async'),
    rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'wound.id, ' +
        'wound.canon, ' +
        'wound.name, ' +
        'person_has_wound.heal, ' +
        'person_has_wound.timestwo ' +
        'FROM person_has_wound ' +
        'LEFT JOIN wound ON wound.id = person_has_wound.wound_id';

    router.get(path + '/id/:id/wound', function(req, res) {
        var call = query + ' WHERE ' +
            'person_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"heal": "ASC", "name": "ASC"});
    });

    router.post(path + '/id/:id/wound', function(req, res) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.name = req.body.name;
        insert.timestwo = req.body.timestwo;

        async.series([
            function(callback) {
                rest.personAuth(pool, person, callback);
            },
            function(callback) {
                rest.query(pool, 'INSERT INTO wound (name) VALUES (?)', [insert.name], function(err,result) {
                    insert.id = result.insertId;

                    callback(err);
                });
            },
            function(callback) {
                rest.query(pool, 'INSERT INTO person_has_wound (person_id,wound_id,timestwo) VALUES (?,?,?)', [person.id, insert.id, insert.timestwo], callback);
            }
        ],function(err) {
            if (err) {
                var status = err.status ? err.status : 500;
                res.status(status).send({code: err.code, message: err.message});
            } else {
                res.status(200).send();
            }
        });
    });

    router.put(path + '/id/:id/wound/:id2/heal/:heal', function(req, res) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.params.id2;
        insert.heal = req.params.heal;

        async.series([
            function(callback) {
                rest.personAuth(pool, person, callback);
            },
            function(callback) {
                rest.query(pool, 'UPDATE person_has_wound SET heal = ? WHERE person_id = ? AND wound_id = ?', [insert.heal, person.id, insert.id], callback);
            }
        ],function(err) {
            if (err) {
                var status = err.status ? err.status : 500;
                res.status(status).send({code: err.code, message: err.message});
            } else {
                res.status(200).send();
            }
        });
    });
};