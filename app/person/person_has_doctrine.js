var async = require('async'),
    rest = require('./../rest');

module.exports = function(router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'doctrine.id, ' +
        'doctrine.canon, ' +
        'doctrine.name, ' +
        'doctrine.description, ' +
        'doctrine.icon' +
        'person_has_doctrine.value, ' +
        'FROM person_has_doctrine ' +
        'LEFT JOIN doctrine ON doctrine.id = person_has_doctrine.doctrine_id';

    router.get(path + '/id/:id/doctrine', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_doctrine.person_id = ?';

        rest.QUERY(req, res, call, [req.params.id]);
    });

    router.post(path + '/id/:id/doctrine', function(req, res) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = parseInt(req.body.insert_id);
        insert.value = parseInt(req.body.value);

        async.series([
            function(callback) {
                rest.personAuth(pool, person, callback);
            },
            function(callback) {
                rest.query(pool, 'INSERT INTO person_has_doctrine (person_id,doctrine_id,value) VALUES (?,?,?) ON DUPLICATE KEY UPDATE value = VALUES(value)', [person.id, insert.id, insert.value], callback);
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

    router.put(path + '/id/:id/doctrine', function(req, res) {
        var person = {},
            insert = {},
            current = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = parseInt(req.body.insert_id);
        insert.value = parseInt(req.body.value);

        async.series([
            function(callback) {
                rest.personAuth(pool, person, callback);
            },
            function(callback) {
                rest.query(pool, 'SELECT value FROM person_has_doctrine WHERE person_id = ? AND doctrine_id = ?', [person.id, insert.id], function(err, result) {
                    current.value = !!result[0] ? parseInt(result[0].value) : 0;

                    insert.value = insert.value + current.value;

                    callback(err);
                });
            },
            function(callback) {
                rest.query(pool, 'INSERT INTO person_has_doctrine (person_id,doctrine_id,value) VALUES (?,?,?) ON DUPLICATE KEY UPDATE value = VALUES(value)', [person.id, insert.id, insert.value], callback);
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