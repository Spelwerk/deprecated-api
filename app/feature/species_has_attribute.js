var async = require('async'),
    mysql = require('mysql'),
    rest = require('./../rest'),
    tokens = require('./../tokens');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM species_has_attribute ' +
        'LEFT JOIN attribute ON attribute.id = species_has_attribute.attribute_id';

    router.get(path + '/id/:id/attribute', function(req, res) {
        var call = query + ' WHERE ' +
            'species_has_attribute.species_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"attribute_id": "ASC"});
    });

    router.post(path + '/id/:id/attribute', function(req, res) {
        var species = {},
            insert = {},
            user = {};

        species.id = req.params.id;

        insert.id = req.body.attribute_id;
        insert.value = parseInt(req.body.value);

        user.token = tokens.decode(req);
        user.valid = tokens.validate(req, user.token);

        user.id = user.valid && user.token.sub.verified
            ? user.token.sub.id
            : null;

        user.admin = user.valid && user.token.sub.verified
            ? user.token.sub.admin
            : null;

        if(!user.valid) {
            res.status(400).send('User not logged in.');
        } else {
            async.parallel([
                function(callback) {
                    pool.query(mysql.format('SELECT owner FROM user_has_species WHERE user_id = ? AND species_id = ?',[user.id,species.id]),callback);
                },
                function(callback) {
                    pool.query(mysql.format('SELECT points FROM species WHERE id = ?',[species.id]),callback);
                }
            ],function(err,results) {
                user.owner = !!results[0][0][0];
                species.points = parseInt(results[1][0][0].points);

                if(!user.owner && !user.admin) {
                    res.status(400).send('Not user, nor admin.');
                } else {
                    async.parallel([
                        function(callback) {
                            pool.query(mysql.format('INSERT INTO species_has_attribute (species_id,attribute_id,value) VALUES (?,?,?) ON DUPLICATE KEY UPDATE value = VALUES(value)',[species.id,insert.id,insert.value]),callback);
                        },
                        function(callback) {
                            species.points += insert.value;

                            pool.query(mysql.format('UPDATE species SET points = ? WHERE id = ?',[species.points,species.id]),callback);
                        }
                    ],function(err) {
                        if(err) {
                            res.status(500).send(err);
                        } else {
                            res.status(200).send();
                        }
                    });
                }
            });
        }
    });

    router.delete(path + '/id/:id/attribute/:id2', function(req, res) {
        rest.tableDeleteHas(pool, req, res, 'species', req.params.id, 'attribute', req.params.id2);
    });
};