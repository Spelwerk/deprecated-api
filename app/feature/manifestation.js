var async = require('async'),
    rest = require('./../rest');

module.exports = function(router, tableName, path) {
    path = path || '/' + tableName;

    var query = 'SELECT * FROM manifestation';

    router.get(path, function(req, res, next) {
        var call = query + ' WHERE deleted is NULL';

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
            'LEFT JOIN user_has_manifestation ON (user_has_manifestation.manifestation_id = manifestation.id AND user_has_manifestation.owner = 1 AND user_has_manifestation.user_id = ?) ' +
            'WHERE id = ?';

        rest.QUERY(req, res, next, call, [req.user.id, req.params.id]);
    });

    router.post(path, function(req, res, next) {
        if(!req.user.id) return next('Forbidden.');

        var power = {},
            skill = {},
            insert = {};

        insert.name = req.body.name;
        insert.description = req.body.description;
        insert.icon = req.body.icon;

        power.name = req.body.power;
        skill.name = req.body.skill;

        async.series([
            function(callback) {
                rest.query('INSERT INTO skill (name,manifestation) VALUES (?,1)', [skill.name], function(err, result) {
                    skill.id = result.insertId;

                    callback(err);
                });
            },
            function(callback) {
                if(!req.user.admin) return callback();

                rest.query('INSERT INTO user_has_skill (user_id,skill_id,owner) VALUES (?,?,1)', [req.user.id, skill.id], callback);
            },
            function (callback) {
                rest.query('INSERT INTO attribute (name,attributetype_id) VALUES (?,9)', [power.name], function(err, result) {
                    power.id = result.insertId;

                    callback(err);
                })
            },
            function(callback) {
                if(!req.user.admin) return callback();

                rest.query('INSERT INTO user_has_attribute (user_id,attribute_id,owner) VALUES (?,?,1)', [req.user.id, power.id], callback);
            },
            function (callback) {
                rest.query('INSERT INTO manifestation (name,description,icon,power_id,skill_id) VALUES (?,?,?,?,?)', [insert.name, insert.description, insert.icon, power.id, skill.id], function(err, result) {
                    insert.id = result.insertId;

                    callback(err);
                });
            },
            function(callback) {
                if(!req.user.admin) return callback();

                rest.query('INSERT INTO user_has_manifestation (user_id,manifestation_id,owner) VALUES (?,?,1)', [req.user.id, insert.id], callback);
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

    router.put(path + '/revive/:id', function(req, res, next) {
        req.table.name = tableName;

        rest.REVIVE(req, res, next);
    });

    router.delete(path + '/id/:id', function(req, res, next) {
        req.table.name = tableName;
        req.table.admin = false;
        req.table.user = true;

        rest.DELETE(req, res, next, table);
    });
};