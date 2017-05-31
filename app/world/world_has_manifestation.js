var async = require('async'),
    rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM world_has_manifestation ' +
        'LEFT JOIN manifestation ON manifestation.id = world_has_manifestation.manifestation_id';

    router.get(path + '/id/:id/manifestation', function(req, res, next) {
        var call = query + ' WHERE ' +
            'manifestation.canon = 1 AND ' +
            'world_has_manifestation.world_id = ? AND ' +
            'manifestation.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/manifestation', function(req, res, next) {
        var table = {},
            insert = {},
            manifestation = {};

        table.id = parseInt(req.params.id);
        table.name = 'world';

        insert.id = parseInt(req.body.insert_id);

        async.series([
            function(callback) {
                rest.userAuth(req, 'NAME', ID, callback);
            },
            function(callback) {
                rest.query( 'SELECT id FROM expertise WHERE canon = 1 AND manifestation_id = ? AND doctrine_id IS NOT NULL', [insert.id], function(err, result) {
                    manifestation.expertise = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.query( 'INSERT INTO world_has_manifestation (world_id,manifestation_id) VALUES (?,?)', [table.id, insert.id], callback);
            },
            function(callback) {
                if(!manifestation.expertise[0]) return callback();

                var call = 'INSERT INTO world_has_expertise (world_id,expertise_id) VALUES ';

                for(var i in manifestation.expertise) {
                    call += '(' + table.id + ',' + manifestation.expertise[i].id + '),';
                }

                call = call.slice(0, -1) + ' ON DUPLICATE KEY UPDATE expertise_id = VALUES(expertise_id)';

                rest.query( call, null, callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });

    router.delete(path + '/id/:id/manifestation/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'world', req.params.id, 'manifestation', req.params.id2);
    });
};