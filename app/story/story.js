var async = require('async'),
    logger = require('./../logger'),
    rest = require('./../rest'),
    hasher = require('./../hasher');

module.exports = function(router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM story';

    router.get(path, function(req, res, next) {
        rest.QUERY(req, res, next, query);
    });

    router.get(path + '/id/:id', function(req, res, next) {
        var call = query + ' WHERE id = ?';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/deleted', function(req, res, next) {
        var call = query + ' WHERE ' + table + '.deleted is NOT NULL';

        rest.QUERY(req, res, next, call);
    });

    // Story

    router.post(path, function(req, res, next) {
        var story = {},
            insert = {};

        story.secret = hasher(32);

        insert.name = req.body.name;
        insert.description = req.body.description;
        insert.plot = req.body.plot;
        insert.world = parseInt(req.body.world_id);

        async.series([
            function (callback) {
                rest.query('INSERT INTO story (secret,name,description,plot,world_id) VALUES (?,?,?,?,?)', [story.secret, insert.name, insert.description, insert.plot, insert.world], function(err, result) {
                    story.id = result.insertId;

                    callback(err);
                });
            },
            function(callback) {
                if(!req.user.id) return callback();

                rest.query('INSERT INTO user_has_story (user_id,person_id,secret,owner) VALUES (?,?,?,1)', [req.user.id, story.id, story.secret], callback);
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
        story.secret = req.body.secret;

        insert.name = req.body.name;
        insert.description = req.body.description;
        insert.plot = req.body.plot;

        async.series([
            function(callback) {
                rest.query('SELECT secret FROM story WHERE id = ? AND secret = ?', [story.id, story.secret], function(err, result) {
                    story.auth = !!result[0];

                    if(!story.auth) return callback('Forbidden.');

                    callback(err);
                });
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
        req.table.name = 'story';

        rest.REVIVE(req, res, next);
    });

    router.delete(path + '/id/:id', function(req, res, next) {
        req.table.name = 'story';
        req.table.admin = false;
        req.table.user = true;

        rest.DELETE(req, res, next);
    });

    // RELATIONSHIPS

    require('./story_has_meeting')(router, table, path);

    require('./story_has_person')(router, table, path);
};