var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'bionic.id, ' +
        'bionic.name, ' +
        'bionic.description, ' +
        'bionic.price, ' +
        'bionic.energy, ' +
        'bionic.legal, ' +
        'bionic.bodypart_id, ' +
        'bodypart.name AS bodypart_name, ' +
        'person_has_bionic.bionicquality_id AS quality_id, ' +
        'bionicquality.name AS quality_name, ' +
        'bionicquality.price AS quality_price, ' +
        'bionicquality.energy AS quality_energy, ' +
        'icon.path AS icon_path ' +
        'FROM person_has_bionic ' +
        'LEFT JOIN bionic ON bionic.id = person_has_bionic.bionic_id ' +
        'LEFT JOIN bodypart ON bodypart.id = bionic.bodypart_id ' +
        'LEFT JOIN bionicquality ON bionicquality.id = person_has_bionic.bionicquality_id ' +
        'LEFT JOIN icon ON icon.id = bionic.icon_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path + '/id/:id1/body/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_bionic.person_id = ? AND ' +
            'bionic.bodypart_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id1,req.params.id2]);
    });

    router.post(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var call = {
            "person_id": req.params.id1,
            "bionic_id": req.params.id2
        };

        rest.REMOVE(pool, req, res, table, call);
    });
};