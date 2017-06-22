var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM person_has_software ' +
        'LEFT JOIN software ON software.id = person_has_software.software_id';

    router.get(path + '/id/:id/software', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_has_software.person_id = ?';

        rest.GET(req, res, next, call, [req.params.id], {"name": "ASC"});
    });

    router.post(path + '/id/:id/software', function(req, res, next) {
        rest.relationPost(req, res, next, 'person', req.params.id, 'software', req.body.insert_id);
    });

    router.delete(path + '/id/:id/software/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'person', req.params.id, 'software', req.params.id2);
    });
};