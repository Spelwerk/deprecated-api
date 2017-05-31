var async = require('async'),
    rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM world_has_species ' +
        'LEFT JOIN species ON species.id = world_has_species.species_id';

    router.get(path + '/id/:id/species', function(req, res, next) {
        var call = query + ' WHERE ' +
            'species.canon = 1 AND ' +
            'world_has_species.world_id = ? AND ' +
            'species.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/id/:id/species/playable', function(req, res, next) {
        var call = query + ' WHERE ' +
            'species.canon = 1 AND ' +
            'species.playable = 1 AND ' +
            'world_has_species.world_id = ? AND ' +
            'species.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/id/:id/species/creature', function(req, res, next) {
        var call = query + ' WHERE ' +
            'species.canon = 1 AND ' +
            'species.playable = 0 AND ' +
            'world_has_species.world_id = ? AND ' +
            'species.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/species', function(req, res, next) {
        var table = {},
            insert = {},
            species = {};

        table.id = req.params.id;
        table.name = 'world';

        insert.id = parseInt(req.body.insert_id);

        async.series([
            function(callback) {
                rest.userAuth(req, 'NAME', ID, callback);
            },
            function(callback) {
                rest.query('SELECT id FROM skill WHERE canon = 1 AND species_id = ?', [insert.id], function(err, result) {
                    species.skill = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('SELECT id FROM expertise WHERE canon = 1 AND species_id = ?', [insert.id], function(err, result) {
                    species.expertise = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('INSERT INTO world_has_species (world_id,species_id) VALUES (?,?)', [table.id, insert.id], callback);
            },
            function(callback) {
                if(!species.skill[0]) return callback();

                var call = 'INSERT INTO world_has_skill (world_id,skill_id) VALUES ';

                for(var i in species.skill) {
                    call += '(' + table.id + ',' + species.skill[i].id + '),';
                }

                call = call.slice(0, -1) + ' ON DUPLICATE KEY UPDATE skill_id = VALUES(skill_id)';

                rest.query(call, null, callback);
            },
            function(callback) {
                if(!species.expertise[0]) return callback();

                var call = 'INSERT INTO world_has_expertise (world_id,expertise_id) VALUES ';

                for(var i in species.expertise) {
                    call += '(' + table.id + ',' + species.expertise[i].id + '),';
                }

                call = call.slice(0, -1) + ' ON DUPLICATE KEY UPDATE expertise_id = VALUES(expertise_id)';

                rest.query(call, null, callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });

    router.delete(path + '/id/:id/species/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'world', req.params.id, 'species', req.params.id2);
    });
};