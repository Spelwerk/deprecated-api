var mysql = require('mysql'),
    async = require('async'),
    logger = require('./../logger'),
    rest = require('./../rest'),
    hasher = require('./../hasher');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'attribute.id, ' +
        'attribute.canon, ' +
        'attribute.special, ' +
        'attribute.name, ' +
        'person_has_attribute.value, ' +
        'attribute.description, ' +
        'attribute.protected, ' +
        'attribute.attributetype_id, ' +
        'attributetype.name AS attributetype_name, ' +
        'attributetype.maximum, ' +
        'icon.path AS icon_path ' +
        'FROM person_has_attribute ' +
        'LEFT JOIN attribute ON attribute.id = person_has_attribute.attribute_id ' +
        'LEFT JOIN attributetype ON attributetype.id = attribute.attributetype_id ' +
        'LEFT JOIN icon ON icon.id = attribute.icon_id';

    router.get(path + '/id/:id/attribute', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_attribute.person_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/id/:id/attribute/id/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_attribute.person_id = ? AND ' +
            'person_has_attribute.attribute_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id2]);
    });

    router.get(path + '/id/:id/attribute/type/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_attribute.person_id = ? AND ' +
            'attribute.attributetype_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id2]);
    });

    router.post(path + '/id/:id/attribute', function(req, res) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.attribute_id;
        insert.value = parseInt(req.body.value);

        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),function(err,result) {
            person.auth = !!result[0];

            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else if(!person.auth) {
                res.status(500).send({header: 'Wrong Secret', message: 'You provided the wrong secret', code: 0});
            } else {
                pool.query(mysql.format('INSERT INTO person_has_attribute (person_id,attribute_id,value) VALUES (?,?,?) ON DUPLICATE KEY UPDATE value = VALUES(value)',[person.id,insert.id,insert.value]),function(err) {
                    if (err) {
                        res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
                    } else {
                        res.status(200).send();
                    }
                });
            }
        });
    });

    router.put(path + '/id/:id/attribute', function(req, res) {
        var person = {},
            insert = {},
            current = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.attribute_id;
        insert.value = parseInt(req.body.value);

        async.parallel([
            function(callback) {
                pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),callback);
            },
            function(callback) {
                pool.query(mysql.format('SELECT value FROM person_has_attribute WHERE person_id = ? AND attribute_id = ?',[person.id,insert.id]),callback);
            }
        ],function(err,results) {
            person.auth = !!results[0][0][0];

            if(person.auth) {
                current.value = results[1][0][0] !== undefined
                    ? parseInt(results[1][0][0].value)
                    : 0;

                insert.value = insert.value + current.value;

                pool.query(mysql.format('INSERT INTO person_has_attribute (person_id,attribute_id,value) VALUES (?,?,?) ON DUPLICATE KEY UPDATE value = VALUES(value)',[person.id,insert.id,insert.value]),function(err) {
                    if(err) {
                        res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
                    } else {
                        res.status(200).send();
                    }
                });
            }
        });
    });
};