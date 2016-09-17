var rest = require('./../rest'),
    hasher = require('./../hasher');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'story.id, ' +
        'story.name, ' +
        'story.description, ' +
        'story.setting_id, ' +
        'setting.name AS setting_name, ' +
        'story.created, ' +
        'story.deleted ' +
        'FROM story ' +
        'LEFT JOIN setting ON setting.id = story.setting_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path, function(req, res) {
        rest.QUERY(pool, req, res, query, null);
    });

    router.get(path + '/hash/:id', function(req, res) {
        var call = query + ' WHERE story.hash = ?';
        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path, function(req, res) {
        req.body.hash = hasher(20);
        rest.POST(pool, req, res, table, req.body);
    });

    router.put(path + '/hash/:id', function(req, res) {
        if (req.body.hash) {
            res.status(403).send({error: 'hash cannot be changed'})
        } else {
            rest.PUT(pool, req, res, table, req.body, 'hash');
        }
    });

    router.delete(path + '/hash/:id', function(req, res) {
        rest.DELETE(pool, req, res, table, 'hash');
    });
};