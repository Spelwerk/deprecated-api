var async = require('async'),
    rest = require('./../rest');

module.exports = function(router, tableName, path) {
    path = path || '/' + tableName;

    var query = 'SELECT * FROM story';

    router.get(path, function(req, res, next) {
        rest.QUERY(req, res, next, query);
    });

    router.get(path + '/id/:id', function(req, res, next) {
        var call = query + ' ' +
            'LEFT JOIN user_has_story ON (user_has_story.story_id = story.id AND user_has_story.owner = 1 AND user_has_story.user_id = ?) ' +
            'WHERE id = ?';

        rest.QUERY(req, res, next, call, [req.user.id, req.params.id]);
    });

    router.get(path + '/deleted', function(req, res, next) {
        var call = query + ' WHERE deleted is NOT NULL';

        rest.QUERY(req, res, next, call);
    });

    // Story

    router.post(path, function(req, res, next) {
        if(!req.user.id) return next('Forbidden.');

        var story = {},
            insert = {};

        insert.name = req.body.name;
        insert.description = req.body.description;
        insert.plot = req.body.plot;
        insert.world = parseInt(req.body.world_id);

        async.series([
            function(callback) {
                rest.query('INSERT INTO story (name,description,plot,world_id) VALUES (?,?,?,?)', [insert.name, insert.description, insert.plot, insert.world], function(err, result) {
                    story.id = result.insertId;

                    callback(err);
                });
            },
            function(callback) {
                if(!req.user.id) return callback();

                rest.query('INSERT INTO user_has_story (user_id,story_id,owner) VALUES (?,?,1)', [req.user.id, story.id], callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send({id: story.id, secret: story.secret});
        });
    });

    router.put(path + '/id/:id', function(req, res, next) {
        var story = {},
            insert = {};

        story.id = parseInt(req.params.id);

        insert.name = req.body.name;
        insert.description = req.body.description;
        insert.plot = req.body.plot;

        async.series([
            function(callback) {
                rest.userAuth(req, false, 'story', req.params.id, callback);
            },
            function(callback) {
                rest.query('UPDATE story SET name = ?, description = ?, plot = ? WHERE id = ?', [insert.name, insert.description, insert.plot, story.id], callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });

    router.put(path + '/revive/:id', function(req, res, next) {
        rest.REVIVE(req, res, next, tableName, req.params.id);
    });

    router.delete(path + '/id/:id', function(req, res, next) {
        rest.DELETE(req, res, next, false, tableName, req.params.id);
    });

    // RELATIONSHIPS

    require('./story_has_location')(router, path);

    require('./story_has_meeting')(router, path);

    require('./story_has_person')(router, path);
};