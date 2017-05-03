var async = require('async'),
    rest = require('./../rest'),
    moment = require('moment'),
    hasher = require('./../hasher');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM meeting';

    router.get(path + '/id/:id/meeting', function(req, res) {
        var call = query + ' WHERE ' +
            'story_id = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/id/:id/meeting/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'story_id = ? AND ' +
            'id = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id2]);
    });

    router.post(path + '/id/:id/meeting', function(req, res) {
        var story = {},
            insert = {};

        story.id = req.params.id;
        story.secret = req.body.secret;

        insert.name = moment().format('dddd Do MMM YYYY');
        insert.description = req.body.description;
        insert.notes = req.body.notes;

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
                rest.query(pool, 'INSERT INTO meeting (name,description,notes,story_id) VALUES (?,?,?,?)', [insert.name, insert.description, insert.notes, story.id], callback);
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

    router.put(path + '/id/:id/meeting/:id2', function(req, res) {
        var story = {},
            meeting = {},
            insert = {};

        story.id = req.params.id;
        story.secret = req.body.secret;

        meeting.id = req.params.id2;

        insert.name = req.body.name;
        insert.description = req.body.description;
        insert.notes = req.body.notes;

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
                rest.query(pool, 'UPDATE meeting SET name = ?, description = ?, notes = ? WHERE id = ?', [insert.name, insert.description, insert.notes, meeting.id], callback);
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
};