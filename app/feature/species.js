var async = require('async'),
    rest = require('./../rest'),
    tokens = require('./../tokens');

module.exports = function(router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM species';

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'deleted is NULL';

        rest.QUERY(req, res, call);
    });

    router.get(path + '/deleted', function(req, res) {
        var call = query + ' WHERE deleted is NOT NULL';

        rest.QUERY(req, res, call, null, {"id": "ASC"});
    });

    router.get(path + '/all', function(req, res) {
        rest.QUERY(req, res, query, null, {"id": "ASC"});
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' ' +
            'LEFT JOIN user_has_species ON (user_has_species.species_id = species.id AND user_has_species.owner = 1 AND user_has_species.user_id = ?) ' +
            'WHERE id = ?';

        var token = tokens.decode(req),
            userId = token ? token.sub.id : 0;

        rest.QUERY(req, res, call, [userId, req.params.id]);
    });

    router.get(path + '/playable', function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'playable = 1 AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, call, [req.params.id]);
    });

    router.get(path + '/creature', function(req, res) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'playable = 0 AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, call, [req.params.id]);
    });

    router.post(path, function(req, res) {
        var insert = {},
            user = {};

        insert.name = req.body.name;
        insert.description = req.body.description;
        insert.playable = req.body.playable;
        insert.max_age = req.body.max_age;
        insert.multiply_skill = req.body.multiply_skill;
        insert.multiply_expertise = req.body.multiply_expertise;
        insert.icon = req.body.icon;

        user.token = tokens.decode(req);
        user.id = user.token.sub.id;
        user.admin = user.token.sub.admin;

        if(!user.token) {
            res.status(400).send('User not logged in.');
        } else {
            async.series([
                function(callback) {
                    rest.query('INSERT INTO species (name,description,playable,max_age,multiply_skill,multiply_expertise,icon) VALUES (?,?,?,?,?,?,?)', [insert.name, insert.description, insert.playable, insert.max_age, insert.multiply_skill, insert.multiply_expertise, insert.icon], function(err,result) {
                        insert.id = result.insertId;

                        callback(err);
                    });
                },
                function(callback) {
                    var weapon = require('./../config/defaults.json').weapon.default;

                    if(!user.admin) { callback(); } else {
                        rest.query('INSERT INTO species_has_weapon (species_id,weapon_id) VALUES (?,?)', [insert.id, weapon], callback);
                    }
                },
                function(callback) {
                    if(!user.admin) return callback();

                    rest.query('INSERT INTO user_has_species (user_id,species_id,owner) VALUES (?,?,1)', [user.id, insert.id], callback);
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

    router.put(path + '/id/:id', function(req, res) {
        var allowedKeys = ['name','description','max_age','multiply_skill','multiply_expertise','icon'];

        rest.PUT(req, res, table, allowedKeys);
    });

    router.put(path + '/revive/:id', function(req, res) {
        rest.REVIVE(req, res, table);
    });

    router.delete(path + '/id/:id', function(req, res) {
        rest.DELETE(req, res, table);
    });

    require('./species_has_attribute')(router, table, path);

    require('./species_has_weapon')(router, table, path);
};