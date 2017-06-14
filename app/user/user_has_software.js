var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT software.id FROM user_has_software ' +
        'LEFT JOIN software ON software.id = user_has_software.software_id';

    router.get(path + '/id/:id/software', function(req, res, next) {
        var call = query + ' WHERE ' +
            'user_has_software.user_id = ? AND ' +
            'software.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/software', function(req, res, next) {
        rest.userRelationPost(req, res, next, req.params.id, 'software', req.body.insert_id);
    });

    router.delete(path + '/id/:id/software/:id2', function(req, res, next) {
        rest.userRelationDelete(req, res, next, req.params.id, 'software', req.params.id2);
    });
};