var mysql = require('mysql'),
    async = require('async'),
    rest = require('./../rest'),
    tokens = require('./../tokens');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM world_has_manifestation ' +
        'LEFT JOIN manifestation ON manifestation.id = world_has_manifestation.manifestation_id';

    router.get(path + '/id/:id/manifestation', function(req, res) {
        var call = query + ' WHERE ' +
            'manifestation.canon = 1 AND ' +
            'world_has_manifestation.world_id = ? AND ' +
            'manifestation.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path + '/id/:id/manifestation', function(req, res) {
        var world = {},
            insert = {},
            manifestation = {},
            user = {};

        world.id = parseInt(req.params.id);
        insert.id = parseInt(req.body.insert_id);

        user.token = tokens.decode(req);
        user.id = user.token.sub.id;
        user.admin = user.token.sub.admin;

        if(!user.token) {
            res.status(400).send('User not logged in.');
        } else {
            pool.query(mysql.format('SELECT owner FROM user_has_world WHERE user_id = ? AND world_id = ?',[user.id,world.id]),function(err,result) {
                if(err) {
                    res.status(500).send(err);
                } else {
                    user.owner = !!result[0];

                    if(!user.owner && !user.admin) {
                        res.status(400).send('Not user, nor admin.');
                    } else {
                        async.series([
                            function(callback) {
                                async.parallel([
                                    function(callback) {
                                        pool.query(mysql.format('INSERT INTO world_has_manifestation (world_id,manifestation_id) VALUES (?,?)',[world.id,insert.id]),callback);
                                    },
                                    function(callback) {
                                        pool.query(mysql.format('SELECT id FROM expertise WHERE manifestation_id = ?',[insert.id]),callback);
                                    }
                                ],function(err,results) {
                                    manifestation.expertise = results[1][0];

                                    callback(err);
                                });
                            },
                            function(callback) {
                                async.parallel([
                                    function(callback) {
                                        if(manifestation.expertise[0] !== undefined) {
                                            var call = 'INSERT INTO world_has_expertise (world_id,expertise_id) VALUES ';

                                            for(var i in manifestation.expertise) {
                                                call += '(' + world.id + ',' + manifestation.expertise[i].id + '),';
                                            }

                                            call = call.slice(0, -1);

                                            pool.query(call,callback);
                                        } else { callback(); }
                                    }
                                ],function(err) {
                                    callback(err);
                                });
                            }
                        ],function(err) {
                            if (err) {
                                res.status(500).send(err);
                            } else {
                                res.status(200).send();
                            }
                        });
                    }
                }
            });
        }
    });

    router.delete(path + '/id/:id/manifestation/:id2', function(req, res) {
        rest.relationDelete(pool, req, res, 'world', 'manifestation');
    });
};