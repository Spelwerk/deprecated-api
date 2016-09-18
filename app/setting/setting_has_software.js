var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'software.id, ' +
        'software.name, ' +
        'software.description, ' +
        'software.price, ' +
        'software.hacking, ' +
        'software.hacking_bonus, ' +
        'software.legal, ' +
        'software.created, ' +
        'software.deleted ' +
        'FROM setting_has_software ' +
        'LEFT JOIN software ON software.id = setting_has_software.software_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'setting_has_software.setting_id = ? AND ' +
            'software.deleted is null';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table, req.body);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var call = {
            "setting_id": req.params.id1,
            "software_id": req.params.id2
        };

        rest.REMOVE(pool, req, res, table, call);
    });
};