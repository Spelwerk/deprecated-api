var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'firstname.id, ' +
        'firstname.name ' +
        'FROM firstnamegroup_has_firstname ' +
        'LEFT JOIN firstname ON firstname.id = firstnamegroup_has_firstname.firstname_id';

    require('../default-has')(pool, router, table, path, ["firstnamegroup_id","firstname_id"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'firstnamegroup_has_firstname.firstnamegroup_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};