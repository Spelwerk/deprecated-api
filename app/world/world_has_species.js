var async = require('async'),
    rest = require('./../rest');

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
        var table = {},
            insert = {},
            species = {};

        table.id = req.params.id;
        table.name = 'world';

        insert.id = parseInt(req.body.insert_id);

        async.series([
            function(callback) {
                rest.userAuth(pool, req, table, false, callback);
            },
            function(callback) {
                rest.query(pool, 'SELECT id FROM skill WHERE species_id = ?', [insert.id], function(err, result) {
                    species.skill = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.query(pool, 'SELECT id FROM expertise WHERE species_id = ?', [insert.id], function(err, result) {
                    species.expertise = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.query(pool, 'INSERT INTO world_has_species (world_id,species_id) VALUES (?,?)', [table.id, insert.id], callback);
            },
            function(callback) {
                if(!species.skill) { callback(); } else {
                    var call = 'INSERT INTO world_has_skill (world_id,skill_id) VALUES ';

                    for(var i in species.skill) {
                        call += '(' + table.id + ',' + species.skill[i].id + '),';
                    }

                    call = call.slice(0, -1);

                    rest.query(pool, call, null, callback);
                }
            },
            function(callback) {
                if(!species.expertise) { callback(); } else {
                    var call = 'INSERT INTO world_has_expertise (world_id,expertise_id) VALUES ';

                    for(var i in species.expertise) {
                        call += '(' + table.id + ',' + species.expertise[i].id + '),';
                    }

                    call = call.slice(0, -1);

                    rest.query(pool, call, null, callback);
                }
            }
        ],function(err) {
            if (err) {
                var status = err.status ? err.status : 500;
                res.status(status).send({code: err.code, message: err.message});
            } else {
                res.status(200).send();
            }
        });
    });

    router.delete(path + '/id/:id/species/:id2', function(req, res) {
        rest.relationDelete(pool, req, res, 'world', 'species');
    });
};