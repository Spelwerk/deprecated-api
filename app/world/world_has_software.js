var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM world_has_software ' +
        'LEFT JOIN software ON software.id = world_has_software.software_id';

    router.get(path + '/id/:id/software', function(req, res, next) {
        var call = query + ' WHERE ' +
            'world_has_software.world_id = ? AND ' +
            'software.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/software', function(req, res, next) {
        rest.relationPost(req, res, next, 'world', req.params.id, 'software', req.body.insert_id);
    });

    router.delete(path + '/id/:id/software/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'world', req.params.id, 'software', req.params.id2);
    });
};