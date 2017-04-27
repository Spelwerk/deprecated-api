var mysql = require('mysql'),
    async = require('async'),
    rest = require('./../rest'),
    tokens = require('./../tokens');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'species.id, ' +
        'species.canon, ' +
        'species.name, ' +
        'species.description, ' +
        'species.playable, ' +
        'species.max_age, ' +
        'species.multiply_skill, ' +
        'species.multiply_expertise, ' +
        'icon.path AS icon_path ' +
        'FROM world_has_species ' +
        'LEFT JOIN species ON species.id = world_has_species.species_id ' +
        'LEFT JOIN icon ON icon.id = species.icon_id';

    router.get(path + '/id/:id/species', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_species.world_id = ? AND ' +
            'species.canon = ? AND ' +
            'species.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, 1]);
    });

    router.get(path + '/id/:id/species/playable/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_species.world_id = ? AND ' +
            'species.playable = ? AND ' +
            'species.canon = ? AND ' +
            'species.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id2, 1]);
    });

    router.post(path + '/id/:id/species', function(req, res) {
        var world = {},
            insert = {},
            species = {},
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
                                        pool.query(mysql.format('INSERT INTO world_has_species (world_id,species_id) VALUES (?,?)',[world.id,insert.id]),callback);
                                    },
                                    function(callback) {
                                        pool.query(mysql.format('SELECT id FROM expertise WHERE species_id = ?',[insert.id]),callback);
                                    },
                                    function(callback) {
                                        pool.query(mysql.format('SELECT id FROM attribute WHERE species_id = ?',[insert.id]),callback);
                                    },
                                    function(callback) {
                                        pool.query(mysql.format('SELECT id FROM gift WHERE species_id = ?',[insert.id]),callback);
                                    },
                                    function(callback) {
                                        pool.query(mysql.format('SELECT id FROM imperfection WHERE species_id = ?',[insert.id]),callback);
                                    },
                                    function(callback) {
                                        pool.query(mysql.format('SELECT id FROM milestone WHERE species_id = ?',[insert.id]),callback);
                                    }
                                ],function(err,results) {
                                    species.expertise = results[1][0];
                                    species.attribute = results[2][0];
                                    species.gift = results[3][0];
                                    species.imperfection = results[4][0];
                                    species.milestone = results[5][0];

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

                                            console.log(call);

                                            pool.query(call,callback);
                                        } else { callback(); }
                                    },
                                    function(callback) {
                                        if(species.attribute[0] !== undefined) {
                                            var call = 'INSERT INTO world_has_attribute (world_id,attribute_id,default_value) VALUES ';

                                            for(var i in species.attribute) {
                                                call += '(' + world.id + ',' + species.attribute[i].id + ',0),';
                                            }

                                            call = call.slice(0, -1);

                                            console.log(call);

                                            pool.query(call,callback);
                                        } else { callback(); }
                                    },
                                    function(callback) {
                                        if(species.gift[0] !== undefined) {
                                            var call = 'INSERT INTO world_has_gift (world_id,gift_id) VALUES ';

                                            for(var i in species.gift) {
                                                call += '(' + world.id + ',' + species.gift[i].id + '),';
                                            }

                                            call = call.slice(0, -1);

                                            console.log(call);

                                            pool.query(call,callback);
                                        } else { callback(); }
                                    },
                                    function(callback) {
                                        if(species.imperfection[0] !== undefined) {
                                            var call = 'INSERT INTO world_has_imperfection (world_id,imperfection_id) VALUES ';

                                            for(var i in species.imperfection) {
                                                call += '(' + world.id + ',' + species.imperfection[i].id + '),';
                                            }

                                            call = call.slice(0, -1);

                                            console.log(call);

                                            pool.query(call,callback);
                                        } else { callback(); }
                                    },
                                    function(callback) {
                                        if(species.milestone[0] !== undefined) {
                                            var call = 'INSERT INTO world_has_milestone (world_id,milestone_id) VALUES ';

                                            for(var i in species.milestone) {
                                                call += '(' + world.id + ',' + species.milestone[i].id + '),';
                                            }

                                            call = call.slice(0, -1);

                                            console.log(call);

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
        rest.worldDeleteHas(pool, req, res, req.params.id, req.params.id2, 'species');
    });
};