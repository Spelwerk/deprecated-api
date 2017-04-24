var mysql = require('mysql'),
    rest = require('./../rest'),
    tokens = require('./../tokens');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'attribute.id, ' +
        'attribute.canon, ' +
        'attribute.name, ' +
        'world_has_attribute.default_value, ' +
        'attribute.description, ' +
        'attribute.protected, ' +
        'attribute.attributetype_id, ' +
        'attributetype.name AS attributetype_name, ' +
        'attributetype.maximum, ' +
        'attribute.species_id, ' +
        'species.name AS species_name, ' +
        'icon.path AS icon_path ' +
        'FROM world_has_attribute ' +
        'LEFT JOIN attribute ON attribute.id = world_has_attribute.attribute_id ' +
        'LEFT JOIN attributetype ON attributetype.id = attribute.attributetype_id ' +
        'LEFT JOIN species ON species.id = attribute.species_id ' +
        'LEFT JOIN icon ON icon.id = attribute.icon_id';

    router.get(path + '/id/:id/attribute', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_attribute.world_id = ? AND ' +
            'attribute.canon = ? AND ' +
            'attribute.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, 1]);
    });

    router.get(path + '/id/:id/attribute/type/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_attribute.world_id = ? AND ' +
            'attribute.attributetype_id = ? AND ' +
            'attribute.canon = ? AND ' +
            'attribute.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id2, 1]);
    });

    router.get(path + '/id/:id/attribute/species/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_attribute.world_id = ? AND ' +
            '(attribute.species_id = ? OR attribute.species_id IS NULL) AND ' +
            'attribute.canon = ? AND ' +
            'attribute.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id2, 1]);
    });

    router.get(path + '/id/:id/attribute/type/:id2/species/:id3', function(req, res) {
        var call = query + ' WHERE ' +
            'world_has_attribute.world_id = ? AND ' +
            'attribute.attributetype_id = ? AND ' +
            '(attribute.species_id = ? OR attribute.species_id IS NULL) AND ' +
            'attribute.canon = ? AND ' +
            'attribute.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id2, req.params.id3, 1]);
    });

    router.post(path + '/id/:id/attribute', function(req, res) {
        var world = {},
            insert = {},
            user = {};

        world.id = req.params.id;

        insert.id = req.body.insert_id;
        insert.value = req.body.insert_value;

        user.token = tokens.decode(req);
        user.valid = tokens.validate(req, user.token);

        user.id = user.valid && user.token.sub.verified
            ? user.token.sub.id
            : null;

        user.admin = user.valid && user.token.sub.verified
            ? user.token.sub.admin
            : null;

        pool.query(mysql.format('SELECT owner FROM user_has_world WHERE user_id = ? AND world_id = ?',[user.id,world.id]),function(err,result) {
            if(err) {
                res.status(500).send(err);
            } else {
                user.owner = !!result[0];

                if(!user.owner && !user.admin) {
                    res.status(400).send('Not user, nor admin.');
                } else {
                    pool.query(mysql.format('INSERT INTO world_has_attribute (world_id,attribute_id,default_value) VALUES (?,?,?)',[world.id,insert.id,insert.value]),function(err) {
                        if(err) {
                            res.status(500).send(err);
                        } else {
                            res.status(200).send();
                        }
                    })
                }
            }
        });
    });

    router.put(path + '/id/:id/attribute', function(req, res) {
        var world = {},
            insert = {},
            user = {};

        world.id = req.params.id;

        insert.id = req.body.insert_id;
        insert.value = req.body.insert_value;

        user.token = tokens.decode(req);
        user.valid = tokens.validate(req, user.token);

        user.id = user.valid && user.token.sub.verified
            ? user.token.sub.id
            : null;

        user.admin = user.valid && user.token.sub.verified
            ? user.token.sub.admin
            : null;

        pool.query(mysql.format('SELECT owner FROM user_has_world WHERE user_id = ? AND world_id = ?',[user.id,world.id]),function(err,result) {
            if(err) {
                res.status(500).send(err);
            } else {
                user.owner = !!result[0];

                if(!user.owner && !user.admin) {
                    res.status(400).send('Not user, nor admin.');
                } else {
                    pool.query(mysql.format('UPDATE world_has_attribute SET default_value = ? WHERE world_id = ? AND attribute_id = ?',[insert.value,world.id,insert.id,]),function(err) {
                        if(err) {
                            res.status(500).send(err);
                        } else {
                            res.status(200).send();
                        }
                    })
                }
            }
        });
    });

    router.delete(path + '/id/:id/attribute/:id2', function(req, res) {
        rest.worldDeleteHas(pool, req, res, req.params.id, req.params.id2, 'attribute');
    });
};