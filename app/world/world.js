var async = require('async'),
    logger = require('./../logger'),
    rest = require('./../rest'),
    defaults = require('./../config').defaults.attribute.id;

module.exports = function(router, tableName, path) {
    path = path || '/' + tableName;

    var query = 'SELECT * FROM world';

    // Get

    router.get(path, function(req, res, next) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'deleted is NULL';

        rest.QUERY(req, res, next, call);
    });

    router.get(path + '/deleted', function(req, res, next) {
        var call = query + ' WHERE ' +
            'deleted is NOT NULL';

        rest.QUERY(req, res, next, call);
    });

    router.get(path + '/id/:id', function(req, res, next) {
        var call = query + ' ' +
            'LEFT JOIN user_has_world ON (user_has_world.world_id = world.id AND user_has_world.owner = 1 AND user_has_world.user_id = ?) ' +
            'WHERE id = ?';

        rest.QUERY(req, res, next, call, [req.user.id, req.params.id]);
    });

    // WORLD

    router.post(path, function(req, res, next) {
        var world = {},
            insert = {};

        if(!req.user.id) return next('Forbidden.');

        insert.name = req.body.name;
        insert.description = req.body.description;

        insert.bionic = parseInt(req.body.bionic);
        insert.augmentation = parseInt(req.body.augmentation);
        insert.software = parseInt(req.body.software);
        insert.supernatural = parseInt(req.body.supernatural);

        insert.split_supernatural = parseInt(req.body.split_supernatural);
        insert.split_skill = parseInt(req.body.split_skill);
        insert.split_expertise = parseInt(req.body.split_expertise);
        insert.split_milestone = parseInt(req.body.split_milestone);
        insert.split_relationship = parseInt(req.body.split_relationship);

        insert.max_gift = parseInt(req.body.max_gift);
        insert.max_imperfection = parseInt(req.body.max_imperfection);
        insert.max_supernatural = parseInt(req.body.max_supernatural);
        insert.max_skill = parseInt(req.body.max_skill);
        insert.max_expertise = parseInt(req.body.max_expertise);
        insert.max_milestone = parseInt(req.body.max_milestone);
        insert.max_relationship = parseInt(req.body.max_relationship);

        var call = 'INSERT INTO world (name,bionic,augmentation,software,supernatural,' +
            'split_supernatural,split_skill,split_expertise,split_milestone,split_relationship,' +
            'max_gift,max_imperfection,max_supernatural,max_skill,max_expertise,max_milestone,max_relationship) VALUES ' +
            '(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

        var values = [insert.name, insert.bionic, insert.augmentation, insert.software, insert.supernatural,
            insert.split_supernatural, insert.split_skill, insert.split_expertise, insert.split_milestone,
            insert.split_relationship, insert.max_gift, insert.max_imperfection, insert.max_supernatural,
            insert.max_skill, insert.max_expertise, insert.max_milestone, insert.max_relationship];

        async.series([
            function(callback) {
                rest.query(call, values, function(err, result) {
                    world.id = result.insertId;

                    callback(err);
                });
            },
            function(callback) {
                var defaultAttributes = [];

                defaultAttributes.push({attribute_id: defaults.resilience, default_value: 8});
                defaultAttributes.push({attribute_id: defaults.stamina, default_value: 8});
                defaultAttributes.push({attribute_id: defaults.tolerance, default_value: 8});
                defaultAttributes.push({attribute_id: defaults.initiative, default_value: 0});
                defaultAttributes.push({attribute_id: defaults.speed, default_value: 0});
                defaultAttributes.push({attribute_id: defaults.disease, default_value: 2});
                defaultAttributes.push({attribute_id: defaults.sanity, default_value: 2});
                defaultAttributes.push({attribute_id: defaults.trauma, default_value: 4});
                defaultAttributes.push({attribute_id: defaults.ballistic, default_value: 0});
                defaultAttributes.push({attribute_id: defaults.bashing, default_value: 0});
                defaultAttributes.push({attribute_id: defaults.piercing, default_value: 0});
                defaultAttributes.push({attribute_id: defaults.slashing, default_value: 0});
                defaultAttributes.push({attribute_id: defaults.damage, default_value: 0});
                defaultAttributes.push({attribute_id: defaults.honor, default_value: 0});
                defaultAttributes.push({attribute_id: defaults.infamy, default_value: 0});
                defaultAttributes.push({attribute_id: defaults.ammunition, default_value: 1});
                defaultAttributes.push({attribute_id: defaults.money, default_value: 1});
                defaultAttributes.push({attribute_id: defaults.rations, default_value: 1});
                defaultAttributes.push({attribute_id: defaults.experience, default_value: 0});
                defaultAttributes.push({attribute_id: defaults.energy, default_value: 0});

                call = 'INSERT INTO world_has_attribute (world_id,attribute_id,value) VALUES ';

                for(var i in defaultAttributes) {
                    call += '(' + world.id + ',' + defaultAttributes[i].attribute_id + ',' + defaultAttributes[i].default_value + '),';
                }

                call = call.slice(0, -1);

                rest.query(call, null, callback);
            },
            function(callback) {
                if(req.user.admin) return callback();

                rest.query('INSERT INTO user_has_world (user_id,world_id,owner) VALUES (?,?,1)', [req.user.id, world.id], callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send({id: world.id});
        });
    });

    router.put(path + '/id/:id', function(req, res, next) {
        var table = {},
            insert = {};

        table.id = req.params.id;
        table.name = 'world';

        insert.name = req.body.name || null;

        insert.bionic = parseInt(req.body.bionic) || null;
        insert.augmentation = parseInt(req.body.augmentation) || null;
        insert.software = parseInt(req.body.software) || null;
        insert.supernatural = parseInt(req.body.supernatural) || null;
        insert.calculated = parseInt(req.body.calculated) || null;

        insert.split_supernatural = parseInt(req.body.split_supernatural) || null;
        insert.split_skill = parseInt(req.body.split_skill) || null;
        insert.split_expertise = parseInt(req.body.split_expertise) || null;
        insert.split_milestone = parseInt(req.body.split_milestone) || null;
        insert.split_relationship = parseInt(req.body.split_relationship) || null;

        insert.max_gift = parseInt(req.body.max_gift) || null;
        insert.max_imperfection = parseInt(req.body.max_imperfection) || null;
        insert.max_supernatural = parseInt(req.body.max_supernatural) || null;
        insert.max_skill = parseInt(req.body.max_skill) || null;
        insert.max_expertise = parseInt(req.body.max_expertise) || null;
        insert.max_milestone = parseInt(req.body.max_milestone) || null;
        insert.max_relationship = parseInt(req.body.max_relationship) || null;

        async.series([
            function(callback) {
                rest.userAuth(req, callback);
            },
            function(callback) {
                var call = 'UPDATE world SET ',
                    values_array = [],
                    query_amount = 0;

                for(var i in insert) {
                    if(insert[i] !== null) {
                        call += i + ' = ?, ';
                        values_array.push(insert[i]);
                        query_amount++;
                    }
                }

                if(query_amount === 0) {
                    callback();
                } else {
                    call = call.slice(0, -2) + ', updated = CURRENT_TIMESTAMP WHERE id = ?';
                    values_array.push(table.id);

                    rest.query(call, values_array, callback);
                }
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });

    router.put(path + '/revive/:id', function(req, res, next) {
        req.table.name = tableName;
        req.table.admin = false;
        req.table.user = true;

        rest.REVIVE(req, res, next);
    });

    router.delete(path + '/id/:id', function(req, res, next) {
        req.table.name = tableName;
        req.table.admin = false;
        req.table.user = true;

        rest.DELETE(req, res, next);
    });

    // RELATIONSHIPS

    require('./world_has_attribute')(router, path);

    require('./world_has_background')(router, path);

    require('./world_has_bionic')(router, path);

    require('./world_has_expertise')(router, path);

    require('./world_has_gift')(router, path);

    require('./world_has_imperfection')(router, path);

    require('./world_has_manifestation')(router, path);

    require('./world_has_milestone')(router, path);

    require('./world_has_protection')(router, path);

    require('./world_has_protection')(router, path);

    require('./world_has_skill')(router, path);

    require('./world_has_species')(router, path);

    require('./world_has_weapon')(router, path);

    require('./world_has_weaponmod')(router, path);
};