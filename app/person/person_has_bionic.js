var async = require('async'),
    energyId = require('./../config').defaults.attribute.id.energy,
    rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'bionic.id, ' +
        'bionic.canon, ' +
        'bionic.name, ' +
        'bionic.description, ' +
        'bionic.price, ' +
        'bionic.energy, ' +
        'bionic.legal, ' +
        'bionic.bodypart_id, ' +
        'bionic.attribute_id, ' +
        'bionic.attribute_value, ' +
        'bionic.icon, ' +
        'person_has_bionic.custom, ' +
        'person_has_bionic.bionicquality_id AS quality_id, ' +
        'bionicquality.price AS quality_price, ' +
        'bionicquality.energy AS quality_energy ' +
        'FROM person_has_bionic ' +
        'LEFT JOIN bionic ON bionic.id = person_has_bionic.bionic_id ' +
        'LEFT JOIN bionicquality ON bionicquality.id = person_has_bionic.bionicquality_id';

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
            energy = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        energy.id = energyId;

        insert.id = parseInt(req.body.insert_id);

        async.series([
            function(callback) {
                rest.personAuth(pool, person, callback);
            },
            function(callback) {
                rest.query(pool, 'SELECT value FROM person_has_attribute WHERE person_id = ? AND attribute_id = ?', [person.id, energy.id], function(err, result) {
                    if(err) return callback(err);

                    person.energy = parseInt(result[0].value);

                    callback();
                });
            },
            function(callback) {
                rest.query(pool, 'SELECT energy FROM bionic WHERE id = ?', [insert.id], function(err, result) {
                    if(err) return callback(err);

                    insert.energy = parseInt(result[0].energy);

                    callback();
                });
            },
            function(callback) {
                rest.query(pool, 'INSERT INTO person_has_bionic (person_id,bionic_id) VALUES (?,?)', [person.id, insert.id], callback);
            },
            function(callback) {
                insert.value = insert.energy + person.energy;

                rest.query(pool, 'UPDATE person_has_attribute SET value = ? WHERE person_id = ? AND attribute_id = ?', [insert.value, person.id, energy.id], callback);
            }
        ],function(err) {
            if (err) {
                var status = err.status ? err.status : 500;
                res.status(status).send({code: err.code, message: err.message});
            } else {
                res.status(200).send();
            }
        });
    });

    router.put(path + '/id/:id/bionic/:id2', function(req, res) {
        rest.personCustomDescription(pool, req, res, 'bionic');
    });
};