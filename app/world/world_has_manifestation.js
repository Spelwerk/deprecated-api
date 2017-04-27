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
            'world_has_manifestation.world_id = ? AND ' +
            'manifestation.canon = ? AND ' +
            'manifestation.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, 1]);
    });

    router.post(path + '/id/:id/manifestation', function(req, res) {
        var world = {},
            insert = {},
            manifestation = {},
            user = {};

        world.id = req.params.id;
        insert.id = req.body.insert_id;

        user.token = tokens.decode(req);
        user.valid = tokens.validate(req, user.token);

        user.id = user.valid && user.token.sub.verified
            ? user.token.sub.id
            : null;

        user.admin = user.valid && user.token.sub.verified
            ? user.token.sub.admin
            : null;

        if(!user.id) {
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
                                        pool.query(mysql.format('SELECT expertisetype_id FROM manifestation WHERE id = ?',[insert.id]),callback);
                                    },
                                    function(callback) {
                                        pool.query(mysql.format('SELECT id FROM gift WHERE manifestation_id = ?',[insert.id]),callback);
                                    },
                                    function(callback) {
                                        pool.query(mysql.format('SELECT id FROM imperfection WHERE manifestation_id = ?',[insert.id]),callback);
                                    },
                                    function(callback) {
                                        pool.query(mysql.format('SELECT id FROM milestone WHERE manifestation_id = ?',[insert.id]),callback);
                                    }
                                ],function(err,results) {
                                    manifestation.select = results[1][0][0];
                                    manifestation.gift = results[2][0];
                                    manifestation.imperfection = results[3][0];
                                    manifestation.milestone = results[4][0];

                                    callback(err);
                                });
                            },
                            function(callback) {
                                pool.query(mysql.format('SELECT id FROM expertise WHERE expertisetype_id = ?',[manifestation.select.expertisetype_id]),function(err,result) {
                                    manifestation.expertise = result;

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
                                    },
                                    function(callback) {
                                        if(manifestation.gift[0] !== undefined) {
                                            var call = 'INSERT INTO world_has_gift (world_id,gift_id) VALUES ';

                                            for(var i in manifestation.gift) {
                                                call += '(' + world.id + ',' + manifestation.gift[i].id + '),';
                                            }

                                            call = call.slice(0, -1);

                                            pool.query(call,callback);
                                        } else { callback(); }
                                    },
                                    function(callback) {
                                        if(manifestation.imperfection[0] !== undefined) {
                                            var call = 'INSERT INTO world_has_imperfection (world_id,imperfection_id) VALUES ';

                                            for(var i in manifestation.imperfection) {
                                                call += '(' + world.id + ',' + manifestation.imperfection[i].id + '),';
                                            }

                                            call = call.slice(0, -1);

                                            pool.query(call,callback);
                                        } else { callback(); }
                                    },
                                    function(callback) {
                                        if(manifestation.milestone[0] !== undefined) {
                                            var call = 'INSERT INTO world_has_milestone (world_id,milestone_id) VALUES ';

                                            for(var i in manifestation.milestone) {
                                                call += '(' + world.id + ',' + manifestation.milestone[i].id + '),';
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
        rest.worldDeleteHas(pool, req, res, req.params.id, req.params.id2, 'manifestation');
    });
};