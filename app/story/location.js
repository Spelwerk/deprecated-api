var rest = require('./../rest');

module.exports = function(router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM location';

    require('./../default')(router, table, path, query);

    router.get(path + '/story/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'location.story_id = ? AND ' +
            'location.deleted IS NULL';

        rest.QUERY(req, res, call, [req.params.id], {"created": "DESC", "updated": "DESC"});
    });
};
