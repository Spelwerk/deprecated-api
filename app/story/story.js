var mysql = require('mysql'),
    async = require('async'),
    logger = require('./../logger'),
    rest = require('./../rest'),
    hasher = require('./../hasher');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM story';

    router.get(path, function(req, res) {
        rest.QUERY(pool, req, res, query, null, {"name": "ASC"});
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"id": "ASC"});
    });

    router.get(path + '/deleted', function(req, res) {
        var call = query + ' WHERE ' + table + '.deleted is NOT NULL';

        rest.QUERY(pool, req, res, call, null, {"id": "ASC"});
    });

    // Story

    router.post(path, function(req, res) {
        var story = {},
            insert = {};

        story.secret = hasher(32);

        insert.name = req.body.name;
        insert.description = req.body.description;
        insert.plot = req.body.plot;

        insert.world = {};
        insert.world.id = req.body.world_id;

        var call = mysql.format('INSERT INTO story (secret,name,description,plot,world_id) VALUES (?,?,?,?,?)',
            [insert.secret, insert.name, insert.description, insert.plot, insert.world.id]);

        pool.query(call,function(err,result) {
            if(err) {
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else {
                story.id = result.insertId;

                res.status(200).send({id: story.id, secret: story.secret});
            }
        });
    });

    router.put(path + '/id/:id', function(req, res) {

    }); // todo with secret

    router.put(path + '/revive/:id', function(req, res) {
        rest.REVIVE(pool, req, res, table);
    }); // todo with secret/admin

    router.delete(path + '/id/:id', function(req, res) {
        rest.DELETE(pool, req, res, table);
    }); // todo with secret/admin

    // Location

    require('./story_has_location')(pool, router, table, path);

    // Meeting

    require('./story_has_meeting')(pool, router, table, path);

    // NPC

    require('./story_has_npc')(pool, router, table, path);

    // Person

    require('./story_has_person')(pool, router, table, path);
};