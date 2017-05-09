var async = require('async'),
    rest = require('./../rest');

module.exports = function(router, tableName, path) {
    path = path || '/' + tableName;

    var query = 'SELECT * FROM doctrine';

    router.get(path + '/manifestation/:id', function(req, res, next) {
        var call = query + ' WHERE ' +
            'doctrine.manifestation_id = ? AND ' +
            'doctrine.deleted IS NULL';

        rest.QUERY(req, res, next, call);
    });

    router.get(path + '/all', function(req, res, next) {
        rest.QUERY(req, res, next, query);
    });

    router.get(path + '/id/:id', function(req, res, next) {
        var call = query + ' WHERE doctrine.id = ?';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/deleted', function(req, res, next) {
        var call = query + ' WHERE doctrine.deleted is NOT NULL';

        rest.QUERY(req, res, next, call);
    });

    router.post(path, function(req, res, next){
        if(!req.user.id) return next('Forbidden.');

        var manifestation = {},
            doctrine = {},
            expertise = {},
            insert = {};

        manifestation.id = req.body.manifestation_id;

        insert.name = req.body.name;
        insert.description = req.body.description;
        insert.manifestation_id = manifestation.id;
        insert.icon = req.body.icon;

        async.series([
            function(callback) {
                if(req.user.admin) return callback();

                rest.query('SELECT * FROM manifestation WHERE id = ?', [manifestation.id], function(err, result) {
                    manifestation.skill = result[0].skill_id;

                    callback(err);
                });
            },
            function(callback) {
                if(req.user.admin) return callback();

                rest.query('SELECT owner FROM user_has_manifestation WHERE user_id = ? AND manifestation_id = ?', [req.user.id, manifestation.id], function(err, result) {
                    req.user.owner = !!result[0];

                    if(!req.user.owner) return callback('User not allowed to post to this table row.');

                    callback(err);
                });
            },
            function(callback) {
                rest.query('INSERT INTO doctrine (name,description,icon,manifestation_id) VALUES (?,?,?,?)', [insert.name, insert.description, insert.icon, manifestation.id], function(err, result) {
                    doctrine.id = result.insertId;

                    callback(err);
                });
            },
            function(callback) {
                if(req.user.admin) return callback();

                rest.query('INSERT INTO user_has_doctrine (user_id,doctrine_id,owner) VALUES (?,?,1)', [req.user.id, doctrine.id], callback);
            },
            function(callback) {
                rest.query('INSERT INTO expertise (name,description,icon,skill_id,manifestation_id,doctrine_id) VALUES (?,?,?,?,?,?)', [insert.name, insert.description, insert.icon, manifestation.skill, manifestation.id, insert.id], function(err, result) {
                    expertise.id = result.insertId;

                    callback(err);
                })
            },
            function(callback) {
                if(req.user.admin) return callback();

                rest.query('INSERT INTO user_has_expertise (user_id,expertise_id,owner) VALUES (?,?,1)', [req.user.id, expertise.id], callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send({id: insert.id});
        });
    });

    router.put(path + '/id/:id', function(req, res, next) {
        req.table.name = tableName;
        req.table.admin = false;
        req.table.user = true;

        rest.PUT(req, res, next);
    });

    router.put(path + '/id/:id/canon', function(req, res, next) {
        req.table.name = tableName;

        rest.CANON(req, res, next);
    });

    router.put(path + '/id/:id/revive', function(req, res, next) {
        req.table.name = tableName;

        rest.REVIVE(req, res, next);
    });

    router.delete(path + '/id/:id', function(req, res, next) {
        req.table.name = tableName;
        req.table.admin = false;
        req.table.user = true;

        rest.DELETE(req, res, next);
    });
};