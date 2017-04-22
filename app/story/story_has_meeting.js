var mysql = require('mysql'),
    async = require('async'),
    logger = require('./../logger'),
    rest = require('./../rest'),
    hasher = require('./../hasher');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    router.get(path + '/id/:id/meeting/:id', function(req, res) {

    }); // todo

    router.post(path + '/id/:id/meeting', function(req, res) {
        var story = {},
            insert = {};

        story.id = req.params.id;
        story.secret = req.body.secret;

        insert.name = req.body.name;
        insert.description = req.body.description;
        insert.notes = req.body.notes;

        var call = mysql.format('SELECT secret FROM story WHERE id = ? AND secret = ?',[story.id, story.secret]);

        pool.query(call, function(err,result) {
            story.auth = !!result[0];

            if(err) {
                res.status(500).send(err);
            } else if(!story.auth) {
                res.status(500).send('Wrong Secret');
            } else {
                var call = mysql.format('INSERT INTO meeting (name,description,notes,story_id) VALUES (?,?,?,?)',
                    [insert.name, insert.description, insert.notes, story.id]);

                pool.query(call,function(err,result) {
                    if(err) {
                        res.status(500).send(err);
                    } else {
                        insert.id = result.insertId;

                        res.status(200).send({id: insert.id});
                    }
                });
            }
        });
    });

    router.put(path + '/id/:id/meeting/:id', function(req, res) {

    }); // todo

    router.delete(path + '/id/:id/meeting/:id', function(req, res) {

    }); // todo
};