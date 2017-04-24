var mysql = require('mysql'),
    async = require('async'),
    logger = require('./../logger'),
    rest = require('./../rest'),
    hasher = require('./../hasher');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'imperfection.id, ' +
        'imperfection.canon, ' +
        'imperfection.name, ' +
        'imperfection.description, ' +
        'person_has_imperfection.custom, ' +
        'icon.path AS icon_path ' +
        'FROM person_has_imperfection ' +
        'LEFT JOIN imperfection ON imperfection.id = person_has_imperfection.imperfection_id ' +
        'LEFT JOIN icon ON icon.id = imperfection.icon_id';

    router.get(path + '/id/:id/imperfection', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_imperfection.person_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"name": "ASC"});
    });

    router.post(path + '/id/:id/imperfection', function(req, res) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.imperfection_id;

        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),function(err,result) {
            person.auth = !!result[0];

            if(err) {
                res.status(500).send(err);
            } else if(!person.auth) {
                res.status(500).send('Wrong Secret');
            } else {
                pool.query(mysql.format('INSERT INTO person_has_imperfection (person_id,imperfection_id) VALUES (?,?)',[person.id,insert.id]),function(err) {
                    if (err) {
                        res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
                    } else {
                        res.status(200).send();
                    }
                });
            }
        });
    });

    router.put(path + '/id/:id/imperfection/:id2', function(req, res) {
        rest.personCustomDescription(pool, req, res, 'imperfection');
    });

    router.delete(path + '/id/:id/imperfection/:id2', function(req, res) {
        rest.personDeleteRelation(req, res, 'imperfection');
    });
};