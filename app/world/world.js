var mysql = require('mysql'),
    async = require('async'),
    logger = require('./../logger'),
    rest = require('./../rest'),
    tokens = require('./../tokens');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM world';

    // Get

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' +
            'canon = ? AND ' +
            'deleted is NULL';

        rest.QUERY(pool, req, res, call, [1]);
    });

    router.get(path + '/deleted', function(req, res) {
        var call = query + ' WHERE deleted is NOT NULL';

        rest.QUERY(pool, req, res, call);
    });

    router.get(path + '/id/:id', function(req, res) {
        var user = {},
            call = null;

        user.token = tokens.decode(req);
        user.valid = tokens.validate(req, user.token);

        user.id = user.valid && user.token.sub.verified
            ? user.token.sub.id
            : null;

        if(user.id) {
            call = mysql.format(query + ' LEFT JOIN user_has_world ON (user_has_world.world_id = world.id AND user_has_world.user_id = ?) WHERE id = ?',[user.id,req.params.id]);
        } else {
            call = mysql.format(query + ' LEFT JOIN user_has_world ON user_has_world.world_id = world.id WHERE id = ?',[req.params.id]);
        }

        rest.QUERY(pool, req, res, call);
    });

    // World

    router.post(path, function(req, res) {
        var world = {},
            insert = {},
            user = {};

        user.token = tokens.decode(req);
        user.valid = tokens.validate(req, user.token);

        user.id = user.valid && user.token.sub.verified
            ? user.token.sub.id
            : null;

        if(!user.id) {
            res.status(400).send('User not logged in.');
        } else {
            insert.name = req.body.name;
            insert.description = req.body.description;

            insert.bionic = req.body.bionic;
            insert.augmentation = req.body.augmentation;
            insert.software = req.body.software;
            insert.supernatural = req.body.supernatural;

            insert.skill_attributetype_id = req.body.skill_attributetype_id;
            insert.attribute_expertisetype_id = req.body.attribute_expertisetype_id;
            insert.dice_expertisetype_id = req.body.dice_expertisetype_id;
            insert.money_attribute_id = req.body.money_attribute_id;

            insert.split_supernatural = req.body.split_supernatural;
            insert.split_skill = req.body.split_skill;
            insert.split_expertise = req.body.split_expertise;
            insert.split_milestone = req.body.split_milestone;
            insert.split_relationship = req.body.split_relationship;

            insert.max_gift = req.body.max_gift;
            insert.max_imperfection = req.body.max_imperfection;
            insert.max_supernatural = req.body.max_supernatural;
            insert.max_skill = req.body.max_skill;
            insert.max_expertise = req.body.max_expertise;
            insert.max_milestone = req.body.max_milestone;
            insert.max_relationship = req.body.max_relationship;

            var call = mysql.format('INSERT INTO world (name,bionic,augmentation,software,supernatural,' +
                'skill_attributetype_id,attribute_expertisetype_id,dice_expertisetype_id,money_attribute_id,' +
                'split_supernatural,split_skill,split_expertise,split_milestone,split_relationship,' +
                'max_gift,max_imperfection,max_supernatural,max_skill,max_expertise,max_milestone,max_relationship) VALUES ' +
                '(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                [insert.name, insert.bionic, insert.augmentation, insert.software, insert.supernatural,
                    insert.skill_attributetype_id, insert.attribute_expertisetype_id, insert.dice_expertisetype_id,
                    insert.money_attribute_id, insert.split_supernatural, insert.split_skill, insert.split_expertise,
                    insert.split_milestone, insert.split_relationship, insert.max_gift, insert.max_imperfection,
                    insert.max_supernatural, insert.max_skill, insert.max_expertise, insert.max_milestone,
                    insert.max_relationship]);

            pool.query(call,function(err,result) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    world.id = result.insertId;

                    async.parallel([
                        function(callback) {
                            var defaultAttributes = [];

                            defaultAttributes.push({attribute_id: 1, default_value: 8});
                            defaultAttributes.push({attribute_id: 2, default_value: 8});
                            defaultAttributes.push({attribute_id: 3, default_value: 8});
                            defaultAttributes.push({attribute_id: 4, default_value: 0});
                            defaultAttributes.push({attribute_id: 5, default_value: 0});
                            defaultAttributes.push({attribute_id: 6, default_value: 0});
                            defaultAttributes.push({attribute_id: 7, default_value: 2});
                            defaultAttributes.push({attribute_id: 8, default_value: 2});
                            defaultAttributes.push({attribute_id: 9, default_value: 4});
                            defaultAttributes.push({attribute_id: 10, default_value: 0});
                            defaultAttributes.push({attribute_id: 11, default_value: 0});
                            defaultAttributes.push({attribute_id: 12, default_value: 0});
                            defaultAttributes.push({attribute_id: 13, default_value: 0});
                            defaultAttributes.push({attribute_id: 16, default_value: 0});
                            defaultAttributes.push({attribute_id: 17, default_value: 0});
                            defaultAttributes.push({attribute_id: 19, default_value: 1});
                            defaultAttributes.push({attribute_id: 20, default_value: 1});
                            defaultAttributes.push({attribute_id: 21, default_value: 1});
                            defaultAttributes.push({attribute_id: 22, default_value: 0});

                            call = 'INSERT INTO world_has_attribute (world_id,attribute_id,default_value) VALUES ';

                            for(var i in defaultAttributes) {
                                call += '(' + world.id + ',' + defaultAttributes[i].attribute_id + ',' + defaultAttributes[i].default_value + '),';
                            }

                            call = call.slice(0, -1);

                            console.log(call);

                            pool.query(call,callback);
                        },
                        function(callback) {
                            pool.query(mysql.format('INSERT INTO user_has_world (user_id,world_id,owner) VALUES (?,?,?)',[user.id, world.id, 1]),callback);
                        }
                    ],function(err) {
                        if (err) {
                            res.status(500).send(err);
                        } else {
                            res.status(200).send({id: world.id});
                        }
                    });
                }
            });
        }
    });

    router.put(path + '/id/:id', function(req, res) {
        var world = {},
            insert = {},
            user = {};

        world.id = req.params.id;

        insert.name = req.body.name;
        insert.bionic = req.body.bionic;
        insert.augmentation = req.body.augmentation;
        insert.software = req.body.software;
        insert.supernatural = req.body.supernatural;

        insert.skill_attributetype_id = req.body.skill_attributetype_id;
        insert.attribute_expertisetype_id = req.body.attribute_expertisetype_id;
        insert.dice_expertisetype_id = req.body.dice_expertisetype_id;
        insert.money_attribute_id = req.body.money_attribute_id;

        insert.split_supernatural = req.body.split_supernatural;
        insert.split_skill = req.body.split_skill;
        insert.split_expertise = req.body.split_expertise;
        insert.split_milestone = req.body.split_milestone;
        insert.split_relationship = req.body.split_relationship;

        insert.max_gift = req.body.max_gift;
        insert.max_imperfection = req.body.max_imperfection;
        insert.max_supernatural = req.body.max_supernatural;
        insert.max_skill = req.body.max_skill;
        insert.max_expertise = req.body.max_expertise;
        insert.max_milestone = req.body.max_milestone;
        insert.max_relationship = req.body.max_relationship;

        user.token = tokens.decode(req);
        user.valid = tokens.validate(req, user.token);

        user.id = user.valid && user.token.sub.verified
            ? user.token.sub.id
            : null;

        if(!user.id) {
            res.status(400).send('User not logged in.');
        } else {
            pool.query(mysql.format('SELECT owner FROM user_has_world WHERE user_id = ? AND world_id = ?', [user.id, world.id]), function (err, result) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    user.owner = !!result[0];

                    if(!user.owner && !user.admin) {
                        res.status(400).send('Not user, nor admin.');
                    } else {
                        var call = 'UPDATE world SET ',
                            values_array = [],
                            query_amount = 0;

                        for(var i in insert) {
                            if(insert[i] !== undefined) {
                                call += i + ' = ?, ';
                                values_array.push(insert[i]);
                                query_amount++;
                            }
                        }

                        if(query_amount === 0) {
                            res.status(500).send('Data missing');
                        } else {
                            call = call.slice(0, -2) + ', updated = CURRENT_TIMESTAMP WHERE id = ?';
                            values_array.push(world.id);

                            pool.query(mysql.format(call,values_array),function(err) {
                                if (err) {
                                    res.status(500).send(err);
                                } else {
                                    res.status(200).send();
                                }
                            });
                        }
                    }
                }
            });
        }
    });

    router.put(path + '/revive/:id', function(req, res) {
        var world = {},
            user = {};

        world.id = req.params.id;

        user.token = tokens.decode(req);
        user.valid = tokens.validate(req, user.token);

        user.id = user.valid && user.token.sub.verified
            ? user.token.sub.id
            : null;

        if(!user.id) {
            res.status(400).send('User not logged in.');
        } else {
            pool.query(mysql.format('SELECT owner FROM user_has_world WHERE user_id = ? AND world_id = ?', [user.id, world.id]), function (err, result) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    user.owner = !!result[0];

                    if(!user.owner && !user.admin) {
                        res.status(400).send('Not user, nor admin.');
                    } else {
                        pool.query(mysql.format('UPDATE world SET deleted = NULL, updated = CURRENT_TIMESTAMP WHERE id = ?',[world.id]),function(err) {
                            if (err) {
                                res.status(500).send(err);
                            } else {
                                res.status(202).send();
                            }
                        });
                    }
                }
            });
        }
    });

    router.delete(path + '/id/:id', function(req, res) {
        var world = {},
            user = {};

        world.id = req.params.id;

        user.token = tokens.decode(req);
        user.valid = tokens.validate(req, user.token);

        user.id = user.valid && user.token.sub.verified
            ? user.token.sub.id
            : null;

        if(!user.id) {
            res.status(400).send('User not logged in.');
        } else {
            pool.query(mysql.format('SELECT owner FROM user_has_world WHERE user_id = ? AND world_id = ?', [user.id, world.id]), function (err, result) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    user.owner = !!result[0];

                    if(!user.owner && !user.admin) {
                        res.status(400).send('Not user, nor admin.');
                    } else {
                        pool.query(mysql.format('UPDATE world SET deleted = CURRENT_TIMESTAMP WHERE id = ?',[world.id]),function(err) {
                            if (err) {
                                res.status(500).send(err);
                            } else {
                                res.status(202).send();
                            }
                        });
                    }
                }
            });
        }
    });

    // Asset

    // Attribute

    require('./world_has_attribute')(pool, router, table, path);

    // Background

    require('./world_has_background')(pool, router, table, path);

    // Bionic

    require('./world_has_bionic')(pool, router, table, path);

    // Companion

    // Country

    // Expertise

    require('./world_has_expertise')(pool, router, table, path);

    // Focus

    require('./world_has_focus')(pool, router, table, path);

    // Gift

    require('./world_has_gift')(pool, router, table, path);

    // Identity

    require('./world_has_identity')(pool, router, table, path);

    // Imperfection

    require('./world_has_imperfection')(pool, router, table, path);

    // Language

    // Manifestation

    require('./world_has_manifestation')(pool, router, table, path);

    // Milestone

    require('./world_has_milestone')(pool, router, table, path);

    // Nature

    require('./world_has_nature')(pool, router, table, path);

    // NPC

    // Protection

    require('./world_has_protection')(pool, router, table, path);

    // Software

    require('./world_has_software')(pool, router, table, path);

    // Species

    require('./world_has_species')(pool, router, table, path);

    // Weapon

    require('./world_has_weapon')(pool, router, table, path);

    // Weapon Mod

    require('./world_has_weaponmod')(pool, router, table, path);
};