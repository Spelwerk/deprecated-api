var mysql = require('mysql'),
    async = require('async'),
    rest = require('./../rest'),
    tokens = require('./../tokens');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM world_has_species ' +
        'LEFT JOIN species ON species.id = world_has_species.species_id';

    router.get(path + '/id/:id/species', function(req, res) {
        var call = query + ' WHERE ' +
            'species.canon = 1 AND ' +
            'world_has_species.world_id = ? AND ' +
            'species.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/id/:id/species/playable', function(req, res) {
        var call = query + ' WHERE ' +
            'species.canon = 1 AND ' +
            'species.playable = 1 AND ' +
            'world_has_species.world_id = ? AND ' +
            'species.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/id/:id/species/creature', function(req, res) {
        var call = query + ' WHERE ' +
            'species.canon = 1 AND ' +
            'species.playable = 0 AND ' +
            'world_has_species.world_id = ? AND ' +
            'species.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path + '/id/:id/species', function(req, res) {
        var world = {},
            insert = {},
            species = {},
            user = {};

        world.id = req.params.id;
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
                                        pool.query(mysql.format('INSERT INTO world_has_species (world_id,species_id) VALUES (?,?)',[world.id,insert.id]),callback);
                                    },
                                    function(callback) {
                                        pool.query(mysql.format('SELECT id FROM expertise WHERE species_id = ?',[insert.id]),callback);
                                    },
                                    function(callback) {
                                        pool.query(mysql.format('SELECT id FROM skill WHERE species_id = ?',[insert.id]),callback);
                                    }
                                ],function(err,results) {
                                    species.expertise = results[1][0];
                                    species.skill = results[2][0];

                                    callback(err);
                                });
                            },
                            function(callback) {
                                async.parallel([
                                    function(callback) {
                                        if(species.expertise[0] !== undefined) {
                                            var call = 'INSERT INTO world_has_expertise (world_id,expertise_id) VALUES ';

                                            for(var i in species.expertise) {
                                                call += '(' + world.id + ',' + species.expertise[i].id + '),';
                                            }

                                            call = call.slice(0, -1);

                                            pool.query(call,callback);
                                        } else { callback(); }
                                    },
                                    function(callback) {
                                        if(species.skill[0] !== undefined) {
                                            var call = 'INSERT INTO world_has_skill (world_id,skill_id) VALUES ';

                                            for(var i in species.skill) {
                                                call += '(' + world.id + ',' + species.skill[i].id + '),';
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

    router.delete(path + '/id/:id/species/:id2', function(req, res) {
        rest.relationDelete(pool, req, res, 'world', 'species');
    });
};