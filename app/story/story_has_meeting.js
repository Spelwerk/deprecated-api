var async = require('async'),
    rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM meeting';

    router.get(path + '/id/:id/meeting', function(req, res, next) {
        var call = query + ' WHERE ' +
            'story_id = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/id/:id/meeting/:id2', function(req, res, next) {
        var call = query + ' WHERE ' +
            'story_id = ? AND ' +
            'id = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id, req.params.id2]);
    });

    router.post(path + '/id/:id/meeting', function(req, res, next) {
        var story = {},
            insert = {};

        story.id = req.params.id;
        story.secret = req.body.secret;

        insert.name = moment().format('dddd Do MMM YYYY');
        insert.notes = req.body.notes;

        async.series([
            function(callback) {
                rest.query('SELECT secret FROM story WHERE id = ? AND secret = ?', [story.id, story.secret], function(err, result) {
                    if(!!result[0]) return callback('Forbidden');

                    callback(err);
                });
            },
            function(callback) {
                rest.query('INSERT INTO meeting (name,notes,story_id) VALUES (?,?,?,?)', [insert.name, insert.notes, story.id], callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });

    router.put(path + '/id/:id/meeting/:id2', function(req, res, next) {
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
                rest.query('SELECT secret FROM story WHERE id = ? AND secret = ?', [story.id, story.secret], function(err, result) {
                    if(!!result[0]) return callback('Forbidden');

                    callback(err);
                });
            },
            function(callback) {
                rest.query('UPDATE meeting SET name = ?, notes = ? WHERE id = ?', [insert.name, insert.notes, meeting.id], callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });
};