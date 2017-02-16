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
        'bionic.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'bionic.attribute_value, ' +
        'person_has_bionic.bionicquality_id AS quality_id, ' +
        'bionicquality.name AS quality_name, ' +
        'bionicquality.price AS quality_price, ' +
        'bionicquality.energy AS quality_energy, ' +
        'icon.path AS icon_path ' +
        'FROM person_has_bionic ' +
        'LEFT JOIN bionic ON bionic.id = person_has_bionic.bionic_id ' +
        'LEFT JOIN bodypart ON bodypart.id = bionic.bodypart_id ' +
        'LEFT JOIN attribute ON attribute.id = bionic.attribute_id ' +
        'LEFT JOIN bionicquality ON bionicquality.id = person_has_bionic.bionicquality_id ' +
        'LEFT JOIN icon ON icon.id = bionic.icon_id';

    require('../default-has')(pool, router, table, path, ["person_id","bionic_id"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_bionic.person_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/id/:id1/bodypart/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_bionic.person_id = ? AND ' +
            'bionic.bodypart_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id1, req.params.id2]);
    });
};