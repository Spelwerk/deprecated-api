var async = require('async'),
    rest = require('./../rest'),
    base = require('./../base');

module.exports = function(router, tableName, path) {
    path = path || '/' + tableName;

    var query = 'SELECT * FROM weapongroup';

    router.get(path, function(req, res, next) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'special = 0 AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/damage/:id', function(req, res, next) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'damage_id = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/skill/:id', function(req, res, next) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'skill_id = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/special', function(req, res, next) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'special = 1 AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    // DEFAULT

    router.get(path + '/all', function(req, res, next) {
        rest.QUERY(req, res, next, query);
    });

    router.get(path + '/deleted', function(req, res, next) {
        var call = query + ' WHERE ' + tableName + '.deleted is NOT NULL';

        rest.QUERY(req, res, next, call);
    });

    // POST

    router.post(path, function(req, res, next) {
        if(!req.user.id) return next('Forbidden.');

        var skill = {},
            expertise = {},
            damage = {},
            insert = {};

        skill.id = req.body.skill_id;

        expertise.name = req.body.name + ' Mastery';

        damage.id = req.body.damage_id;

        insert.name = req.body.name;
        insert.description = req.body.description;
        insert.special = req.body.special;
        insert.icon = req.body.icon;

        async.series([
            function(callback) {
                rest.query('INSERT INTO expertise (name,description,skill_id) VALUES (?,?,?)', [expertise.name, insert.description, skill.id], function(err, result) {
                    expertise.id = result.insertId;

                    callback(err);
                })
            },
            function(callback) {
                rest.query('INSERT INTO user_has_expertise (user_id,expertise_id,owner) VALUES (?,?,1)', [req.user.id, expertise.id], callback);
            },
            function(callback) {
                rest.query('INSERT INTO weapongroup (name,description,special,skill_id,expertise_id,damage_id,icon) VALUES (?,?,?,?,?,?,?)', [insert.name, insert.description, insert.special, skill.id, expertise.id, damage.id, insert.icon], function(err, result) {
                    insert.id = result.insertId;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('INSERT INTO user_has_weapongroup (user_id,weapongroup_id,owner) VALUES (?,?,1)', [req.user.id, insert.id], callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send({id: insert.id});
        });
    });

    // ID

    router.get(path + '/id/:id', function(req, res, next) {
        var call = query + ' WHERE ' + tableName + '.id = ?',
            array = [req.params.id];

        if(req.user) {
            call = query + ' ' +
                'LEFT JOIN user_has_' + tableName + ' ON (user_has_' + tableName + '.' + tableName + '_id = ' + tableName + '.id AND user_has_' + tableName + '.owner = 1 AND user_has_' + tableName + '.user_id = ?) ' +
                'WHERE ' + tableName + '.id = ?';

            array = [req.user.id, req.params.id];
        }

        rest.QUERY(req, res, next, call, array);
    });

    router.get(path + '/id/:id/owner', function(req, res, next) {
        rest.owner(req, res, next, 'weapongroup', req.params.id);
    });

    router.put(path + '/id/:id', function(req, res, next) {
        rest.PUT(req, res, next, false, tableName, req.params.id);
    });

    router.put(path + '/id/:id/canon', function(req, res, next) {
        rest.CANON(req, res, next, tableName, req.params.id);
    });

    router.put(path + '/id/:id/revive', function(req, res, next) {
        rest.REVIVE(req, res, next, tableName, req.params.id);
    });

    router.delete(path + '/id/:id', function(req, res, next) {
        rest.DELETE(req, res, next, false, tableName, req.params.id);
    });
};