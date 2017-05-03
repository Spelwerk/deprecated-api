var async = require('async'),
    rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM world_has_manifestation ' +
        'LEFT JOIN manifestation ON manifestation.id = world_has_manifestation.manifestation_id';

    router.get(path + '/id/:id/manifestation', function(req, res) {
        var call = query + ' WHERE ' +
            'manifestation.canon = 1 AND ' +
            'world_has_manifestation.world_id = ? AND ' +
            'manifestation.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path + '/id/:id/manifestation', function(req, res) {
        var table = {},
            insert = {},
            manifestation = {};

        table.id = parseInt(req.params.id);
        table.name = 'world';

        insert.id = parseInt(req.body.insert_id);

        async.series([
            function(callback) {
                rest.userAuth(pool, req, table, false, callback);
            },
            function(callback) {
                rest.query(pool, 'SELECT id FROM expertise WHERE manifestation_id = ?', [insert.id], function(err, result) {
                    manifestation.expertise = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.query(pool, 'INSERT INTO world_has_manifestation (world_id,manifestation_id) VALUES (?,?)', [table.id, insert.id], callback);
            },
            function(callback) {
                if(!manifestation.expertise) { callback(); } else {
                    var call = 'INSERT INTO world_has_expertise (world_id,expertise_id) VALUES ';

                    for(var i in manifestation.expertise) {
                        call += '(' + table.id + ',' + manifestation.expertise[i].id + '),';
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

    router.delete(path + '/id/:id/manifestation/:id2', function(req, res) {
        rest.relationDelete(pool, req, res, 'world', 'manifestation');
    });
};