var async = require('async'),
    mysql = require('mysql'),
    rest = require('./../rest'),
    tokens = require('./../tokens');

module.exports = function(router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM doctrine';

    router.get(path + '/all', function(req, res) {
        rest.QUERY(req, res, query, null, {"id": "ASC"});
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' + table + '.id = ?';

        rest.QUERY(req, res, call, [req.params.id]);
    });

    router.get(path + '/deleted', function(req, res) {
        var call = query + ' WHERE ' + table + '.deleted is NOT NULL';

        rest.QUERY(req, res, call, null, {"id": "ASC"});
    });

    router.put(path + '/id/:id', function(req, res) {
        rest.PUT(req, res, table, ['name', 'description', 'icon']);
    });

    router.put(path + '/id/:id/canon', function(req, res) {
        rest.CANON(req, res, table);
    });

    router.put(path + '/id/:id/revive', function(req, res) {
        rest.REVIVE(req, res, table);
    });

    router.delete(path + '/id/:id', function(req, res) {
        rest.DELETE(req, res, table, allowsUser);
    });


    router.get(path + '/manifestation/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'doctrine.manifestation_id = ? AND ' +
            'doctrine.deleted IS NULL';

        rest.QUERY(req, res, call);
    });

    router.post(path, function(req, res){
        var manifestation = {},
            doctrine = {},
            expertise = {},
            insert = {},
            user = {};

        manifestation.id = req.body.manifestation_id;

        insert.name = req.body.name;
        insert.description = req.body.description;
        insert.manifestation_id = manifestation.id;
        insert.icon = req.body.icon;

        user.token = tokens.decode(req);
        user.id = user.token.sub.id;
        user.admin = user.token.sub.admin;

        if(!user.token) {
            res.status(400).send('User not logged in.');
        } else {
            async.series([
                function(callback) {
                    rest.query(pool, 'SELECT * FROM manifestation WHERE id = ?', [manifestation.id], function(err,result) {
                        manifestation.skill = result[0].skill_id;

                        callback(err);
                    });
                },
                function(callback) {
                    rest.query(pool, 'SELECT owner FROM user_has_manifestation WHERE user_id = ? AND manifestation_id = ?', [user.id, manifestation.id], function(err,result) {
                        user.owner = !!result[0];

                        callback(err);
                    });
                },
                function(callback) {
                    if(!user.owner && !user.admin) {
                        callback('User not allowed to post to this table row.');
                    } else {
                        rest.query(pool, 'INSERT INTO doctrine (name,description,icon,manifestation_id) VALUES (?,?,?,?)', [insert.name, insert.description, insert.icon, manifestation.id], function(err,result) {
                            doctrine.id = result.insertId;

                            callback(err);
                        });
                    }
                },
                function(callback) {
                    if(!user.owner && !user.admin) { callback(); } else {
                        rest.query(pool, 'INSERT INTO expertise (name,description,icon,skill_id,manifestation_id,doctrine_id) VALUES (?,?,?,?,?,?)', [insert.name, insert.description, insert.icon, manifestation.skill, manifestation.id, insert.id], function(err,result) {
                            expertise.id = result.insertId;

                            callback(err);
                        })
                    }
                },
                function(callback) {
                    if(!user.owner && !user.admin) { callback(); } else {
                        rest.query(pool, 'INSERT INTO user_has_doctrine (user_id,doctrine_id,owner) VALUES (?,?,1)', [user.id, doctrine.id], callback);
                    }
                },
                function(callback) {
                    if(!user.owner && !user.admin) { callback(); } else {
                        rest.query(pool, 'INSERT INTO user_has_expertise (user_id,expertise_id,owner) VALUES (?,?,1)', [user.id, expertise.id], callback);
                    }
                }
            ],function(err) {
                if(err) {
                    res.status(500).send(err);
                } else {
                    res.status(200).send({id: insert.id});
                }
            });
        }
    });
};