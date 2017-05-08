var mysql = require('mysql'),
    async = require('async'),
    logger = require('./../logger'),
    rest = require('./../rest'),
    hasher = require('./../hasher'),
    tokens = require('./../tokens');

module.exports = function(router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM story';

    router.get(path, function(req, res) {
        rest.QUERY(req, res, query, null, {"name": "ASC"});
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE id = ?';

        rest.QUERY(req, res, call, [req.params.id], {"id": "ASC"});
    });

    router.get(path + '/deleted', function(req, res) {
        var call = query + ' WHERE ' + table + '.deleted is NOT NULL';

        rest.QUERY(req, res, call, null, {"id": "ASC"});
    });

    // Story

    router.post(path, function(req, res) {
        var story = {},
            insert = {},
            user = {};

        story.secret = hasher(32);

        insert.name = req.body.name;
        insert.description = req.body.description;
        insert.plot = req.body.plot;
        insert.world = parseInt(req.body.world_id);

        user.token = tokens.decode(req);
        user.id = user.token.sub.id;

        async.series([
            function (callback) {
                rest.query(pool, 'INSERT INTO story (secret,name,description,plot,world_id) VALUES (?,?,?,?,?)', [story.secret, insert.name, insert.description, insert.plot, insert.world], function(err, result) {
                    story.id = result.insertId;

                    callback(err);
                });
            },
            function(callback) {
                if(!user.token) { callback(); } else {
                    rest.query(pool, 'INSERT INTO user_has_story (user_id,person_id,secret,owner) VALUES (?,?,?,1)', [user.id, story.id, story.secret], callback);
                }
            }
        ],function(err) {
            if (err) {
                res.status(500).send({code: err.code, message: err.message});
            } else {
                res.status(200).send({id: story.id, secret: story.secret});
            }
        });


    });

    router.put(path + '/id/:id', function(req, res) {
        var story = {},
            insert = {};

        story.id = parseInt(req.params.id);
        story.secret = req.body.secret;

        insert.name = req.body.name;
        insert.description = req.body.description;
        insert.plot = req.body.plot;

        async.series([
            function(callback) {
                rest.query(pool, 'SELECT secret FROM story WHERE id = ? AND secret = ?', [story.id, story.secret], function(err, result) {
                    story.auth = !!result[0];

                    if(err) return callback(err);

                    if(!story.auth) return callback({status: 403, code: 0, message: 'Forbidden'});

                    callback();
                });
            },
            function(callback) {
                rest.query(pool, 'UPDATE story SET name = ?, description = ?, plot = ? WHERE id = ?', [insert.name, insert.description, insert.plot, story.id], callback);
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

    router.put(path + '/revive/:id', function(req, res) {
        rest.REVIVE(req, res, 'story');
    });

    router.delete(path + '/id/:id', function(req, res) {
        rest.DELETE(req, res, 'story');
    });

    // RELATIONSHIPS

    require('./story_has_meeting')(router, table, path);

    require('./story_has_person')(router, table, path);
};