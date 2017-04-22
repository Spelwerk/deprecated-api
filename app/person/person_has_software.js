var mysql = require('mysql'),
    async = require('async'),
    logger = require('./../logger'),
    rest = require('./../rest'),
    hasher = require('./../hasher');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'software.id, ' +
        'software.canon, ' +
        'software.name, ' +
        'software.description, ' +
        'person_has_software.software_custom, ' +
        'software.price, ' +
        'software.hacking, ' +
        'software.hacking_bonus, ' +
        'software.legal ' +
        'FROM person_has_software ' +
        'LEFT JOIN software ON software.id = person_has_software.software_id';

    router.get(path + '/id/:id/software', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_software.person_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path + '/id/:id/software', function(req, res) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.software_id;

        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),function(err,result) {
            person.auth = !!result[0];

            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else if(!person.auth) {
                res.status(500).send({header: 'Wrong Secret', message: 'You provided the wrong secret', code: 0});
            } else {
                pool.query(mysql.format('INSERT INTO person_has_software (person_id,bionic_id) VALUES (?,?)',[person.id,insert.id]),function(err) {
                    if (err) {
                        res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
                    } else {
                        res.status(200).send();
                    }
                });
            }
        });
    });

    router.delete(path + '/id/:id/software/:id2', function(req, res) {
        rest.personDeleteRelation(req, res, 'software');
    });
};