var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM meeting';

    require('./../default')(pool, router, table, path, query);

    router.get(path + '/story/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'meeting.story_id = ? AND ' +
            'meeting.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id], {"created": "DESC", "updated": "DESC"});
    });
};
