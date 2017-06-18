var async = require('async'),
    rest = require('./../rest');

module.exports = function(router, tableName, path) {
    path = path || '/' + tableName;

    var query = 'SELECT * FROM species';

    router.get(path, function(req, res, next) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'deleted is NULL';

        rest.QUERY(req, res, next, call);
    });

    router.get(path + '/deleted', function(req, res, next) {
        var call = query + ' WHERE deleted is NOT NULL';

        rest.QUERY(req, res, next, call);
    });

    router.get(path + '/all', function(req, res, next) {
        rest.QUERY(req, res, next, query);
    });

    router.get(path + '/id/:id', function(req, res, next) {
        var call = query + ' ' +
            'LEFT JOIN user_has_species ON (user_has_species.species_id = species.id AND user_has_species.owner = 1 AND user_has_species.user_id = ?) ' +
            'WHERE id = ?';

        rest.QUERY(req, res, next, call, [req.user.id, req.params.id]);
    });

    router.get(path + '/id/:id/owner', function(req, res, next) {
        rest.owner(req, res, next, 'species', req.params.id);
    });

    router.get(path + '/playable', function(req, res, next) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'playable = 1 AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/creature', function(req, res, next) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'playable = 0 AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path, function(req, res, next) {
        if(!req.user.id) return next('Forbidden.');

        var insert = {};

        insert.name = req.body.name;
        insert.description = req.body.description;
        insert.playable = req.body.playable;
        insert.max_age = req.body.max_age;
        insert.multiply_skill = req.body.multiply_skill;
        insert.multiply_expertise = req.body.multiply_expertise;
        insert.icon = req.body.icon;

        async.series([
            function(callback) {
                rest.query('INSERT INTO species (name,description,playable,max_age,multiply_skill,multiply_expertise,icon) VALUES (?,?,?,?,?,?,?)', [insert.name, insert.description, insert.playable, insert.max_age, insert.multiply_skill, insert.multiply_expertise, insert.icon], function(err, result) {
                    insert.id = result.insertId;

                    callback(err);
                });
            },
            function(callback) {
                var weapon = require('./../config/defaults.json').weapon.default;

                rest.query('INSERT INTO species_has_weapon (species_id,weapon_id) VALUES (?,?)', [insert.id, weapon], callback);
            },
            function(callback) {
                rest.query('INSERT INTO user_has_species (user_id,species_id,owner) VALUES (?,?,1)', [req.user.id, insert.id], callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send({id: insert.id});
        });
    });

    router.put(path + '/id/:id', function(req, res, next) {
        rest.PUT(req, res, next, false, tableName, req.params.id);
    });

    router.put(path + '/id/:id/canon', function(req, res, next) {
        rest.CANON(req, res, next, tableName, req.params.id);
    });

    router.put(path + '/revive/:id', function(req, res, next) {
        rest.REVIVE(req, res, next, tableName, req.params.id);
    });

    router.delete(path + '/id/:id', function(req, res, next) {
        rest.DELETE(req, res, next, false, tableName, req.params.id);
    });

    require('./species_has_attribute')(router, path);

    require('./species_has_weapon')(router, path);
};