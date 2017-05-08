var async = require('async'),
    rest = require('./../rest'),
    tokens = require('./../tokens');

module.exports = function(router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM manifestation';

    router.get(path, function(req, res) {
        var call = query + ' WHERE deleted is NULL';

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
            'LEFT JOIN user_has_manifestation ON (user_has_manifestation.manifestation_id = manifestation.id AND user_has_manifestation.owner = 1 AND user_has_manifestation.user_id = ?) ' +
            'WHERE id = ?';

        var token = tokens.decode(req),
            userId = token ? token.sub.id : 0;

        rest.QUERY(req, res, call, [userId, req.params.id]);
    });

    router.post(path, function(req, res) {
        var power = {},
            skill = {},
            insert = {},
            user = {};

        insert.name = req.body.name;
        insert.description = req.body.description;
        insert.icon = req.body.icon;

        power.name = req.body.power;
        skill.name = req.body.skill;

        user.token = tokens.decode(req);
        user.id = user.token.sub.id;
        user.admin = user.token.sub.admin;

        if(!user.token) {
            res.status(400).send('User not logged in.');
        } else {
            async.series([
                function(callback) {
                    rest.query('INSERT INTO skill (name,manifestation) VALUES (?,1)', [skill.name], function(err,result) {
                        skill.id = result.insertId;

                        callback(err);
                    });
                },
                function (callback) {
                    rest.query('INSERT INTO attribute (name,attributetype_id) VALUES (?,9)', [power.name], function(err,result) {
                        power.id = result.insertId;

                        callback(err);
                    })
                },
                function (callback) {
                    rest.query('INSERT INTO manifestation (name,description,icon,power_id,skill_id) VALUES (?,?,?,?,?)', [insert.name, insert.description, insert.icon, power.id, skill.id], function(err,result) {
                        insert.id = result.insertId;

                        callback(err);
                    });
                },
                function(callback) {
                    if(!user.admin) return callback();

                    rest.query('INSERT INTO user_has_skill (user_id,skill_id,owner) VALUES (?,?,1)', [user.id, skill.id], callback);
                },
                function(callback) {
                    if(!user.admin) return callback();

                    rest.query('INSERT INTO user_has_attribute (user_id,attribute_id,owner) VALUES (?,?,1)', [user.id, power.id], callback);
                },
                function(callback) {
                    if(!user.admin) return callback();

                    rest.query('INSERT INTO user_has_manifestation (user_id,manifestation_id,owner) VALUES (?,?,1)', [user.id, insert.id], callback);
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
        var allowedKeys = ['name','description','icon'];

        rest.PUT(req, res, table, allowedKeys);
    });

    router.put(path + '/revive/:id', function(req, res) {
        rest.REVIVE(req, res, table);
    });

    router.delete(path + '/id/:id', function(req, res) {
        rest.DELETE(req, res, table);
    });
};