var mysql = require('mysql'),
    async = require('async'),
    logger = require('./../logger'),
    rest = require('./../rest'),
    hasher = require('./../hasher');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'bionic.id, ' +
        'bionic.name, ' +
        'bionic.description, ' +
        'person_has_bionic.bionic_custom, ' +
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

    router.get(path + '/id/:id/bionic', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_bionic.person_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/id/:id/bionic/id/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_bionic.person_id = ? AND ' +
            'person_has_bionic.bionic_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id2]);
    });

    router.get(path + '/id/:id/bionic/bodypart/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_bionic.person_id = ? AND ' +
            'bionic.bodypart_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id2]);
    });

    router.post(path + '/id/:id/bionic', function(req, res) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.bionic_id;

        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),function(err,result) {
            person.auth = !!result[0];

            if(err) {
                res.status(500).send(err);
            } else if(!person.auth) {
                res.status(500).send('Wrong Secret');
            } else {
                pool.query(mysql.format('INSERT INTO person_has_bionic (person_id,bionic_id) VALUES (?,?)',[person.id,insert.id]),function(err) {
                    if (err) {
                        res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
                    } else {
                        res.status(200).send();
                    }
                });
            }
        });
    });

    router.put(path + '/id/:id/bionic/:id2', function(req, res) {
        rest.personCustomDescription(req, res, 'bionic');
    });
};