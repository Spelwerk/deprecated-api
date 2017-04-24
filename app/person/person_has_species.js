var mysql = require('mysql'),
    async = require('async'),
    logger = require('./../logger'),
    rest = require('./../rest'),
    hasher = require('./../hasher');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM person_has_species ' +
        'LEFT JOIN species ON species.id = person_has_species.species_id';

    router.get(path + '/id/:id/species', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_species.person_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"first": "ASC"});
    });

    router.post(path + '/id/:id/species', function(req, res) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.species_id;

        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),function(err,result) {
            person.auth = !!result[0];

            if(err) {
                res.status(500).send(err);
            } else if(!person.auth) {
                res.status(400).send('Wrong secret');
            } else {
                pool.query(mysql.format('INSERT INTO person_has_species (person_id,species_id) VALUES (?,?)',[person.id,insert.id]),function(err) {
                    if(err) {
                        res.status(500).send(err);
                    } else {
                        res.status(200).send();
                    }
                });
            }
        });
    });

    router.put(path + '/id/:id/species/:id2', function(req, res) {
        rest.personCustomDescription(pool, req, res, 'species');
    });

    router.delete(path + '/id/:id/species/:id2', function(req, res) {
        var person = {},
            species = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        species.id = req.params.id2;

        async.parallel([
            function(callback) {
                pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),callback);
            },
            function(callback) {
                pool.query(mysql.format('SELECT first FROM person_has_species WHERE person_id = ? AND species_id = ? AND first = ?',[person.id,species.id,1]),callback);
            }
        ],function(err,results) {
            person.auth = !!results[0][0][0];
            species.first = !!results[1][0][0];

            if(!person.auth) {
                res.status(400).send('Wrong secret');
            } else if(species.first) {
                res.status(400).send('Primary species cannot be changed or removed.');
            } else {
                pool.query(mysql.format('DELETE FROM person_has_species WHERE person_id = ? AND species_id = ?', [person.id, species.id]), function (err) {
                    if(err) {
                        res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
                    } else {
                        res.status(202).send();
                    }
                });
            }
        });
    });
};