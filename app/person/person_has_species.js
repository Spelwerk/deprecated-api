var async = require('async'),
    rest = require('./../rest');

module.exports = function(router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM person_has_species ' +
        'LEFT JOIN species ON species.id = person_has_species.species_id';

    router.get(path + '/id/:id/species', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_species.person_id = ?';

        rest.QUERY(req, res, call, [req.params.id], {"first": "ASC"});
    });

    router.post(path + '/id/:id/species', function(req, res) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = parseInt(req.body.insert_id);

        async.series([
            function(callback) {
                rest.personAuth(pool, person, callback);
            },
            function(callback) {
                rest.query(pool, 'INSERT INTO person_has_species (person_id,species_id) VALUES (?,?)', [person.id, insert.id], callback);
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

    router.put(path + '/id/:id/species/:id2', function(req, res) {
        rest.personCustomDescription(req, res, 'species');
    });

    router.delete(path + '/id/:id/species/:id2', function(req, res) {
        var person = {},
            species = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        species.id = req.params.id2;

        async.series([
            function(callback) {
                rest.personAuth(pool, person, callback);
            },
            function(callback) {
                rest.query(pool, 'SELECT first FROM person_has_species WHERE person_id = ? AND species_id = ? AND first = 1',[person.id, species.id], function(err, result) {
                    species.first = !!result[0];

                    callback(err);
                });
            },
            function(callback) {
                if(species.first) return callback({code: 0, message: 'Primary species cannot be changed or removed.'});

                callback();
            },
            function(callback) {
                rest.query(pool, 'DELETE FROM person_has_species WHERE person_id = ? AND species_id = ?', [person.id, species.id], callback);
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