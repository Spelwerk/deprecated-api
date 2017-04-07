var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM location';

    require('./../default')(pool, router, table, path, query);

    router.get(path + '/story/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'location.story_id = ? AND ' +
            'location.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id], {"created": "DESC", "updated": "DESC"});
    });
};
