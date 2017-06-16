var async = require('async'),
    energyId = require('./../config').defaults.attribute.id.energy,
    rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT ' +
        'bionic.id, ' +
        'bionic.canon, ' +
        'bionic.popularity, ' +
        'bionic.name, ' +
        'bionic.description, ' +
        'bionic.price, ' +
        'bionic.energy, ' +
        'bionic.legal, ' +
        'bionic.bodypart_id, ' +
        'bionic.icon, ' +
        'person_has_bionic.custom, ' +
        'person_has_bionic.bionicquality_id AS quality_id, ' +
        'bionicquality.price AS quality_price, ' +
        'bionicquality.energy AS quality_energy ' +
        'FROM person_has_bionic ' +
        'LEFT JOIN bionic ON bionic.id = person_has_bionic.bionic_id ' +
        'LEFT JOIN bionicquality ON bionicquality.id = person_has_bionic.bionicquality_id';

    router.get(path + '/id/:id/bionic', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_has_bionic.person_id = ?';

        rest.QUERY(req, res, next, call, [req.params.id], {"name": "ASC"});
    });

    router.get(path + '/id/:id/bionic/id/:id2', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_has_bionic.person_id = ? AND ' +
            'person_has_bionic.bionic_id = ?';

        rest.QUERY(req, res, next, call, [req.params.id, req.params.id2]);
    });

    router.get(path + '/id/:id/bionic/bodypart/:id2', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_has_bionic.person_id = ? AND ' +
            'bionic.bodypart_id = ?';

        rest.QUERY(req, res, next, call, [req.params.id, req.params.id2]);
    });

    router.post(path + '/id/:id/bionic', function(req, res, next) {
        var person = {},
            energy = {},
            current = {},
            insert = {};

        person.id = req.params.id;
        energy.id = energyId;
        insert.id = parseInt(req.body.insert_id);

        async.series([
            function(callback) {
                rest.userAuth(req, false, 'person', req.params.id, callback);
            },
            function(callback) {
                rest.query('SELECT attribute_id, value FROM person_has_attribute WHERE person_id = ?', [person.id], function(err, result) {
                    person.attribute = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('SELECT attribute_id, value FROM bionic_has_attribute WHERE bionic_id = ?', [insert.id], function(err, result) {
                    insert.attribute = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('INSERT INTO person_has_bionic (person_id,bionic_id) VALUES (?,?)', [person.id, insert.id], callback);
            },
            function(callback) {
                rest.personInsertAttribute(person, insert, current, callback);
            },
            function(callback) {
                rest.query('SELECT value FROM person_has_attribute WHERE person_id = ? AND attribute_id = ?', [person.id, energy.id], function(err, result) {
                    person.energy = parseInt(result[0].value);

                    callback(err);
                });
            },
            function(callback) {
                rest.query('SELECT energy FROM bionic WHERE id = ?', [insert.id], function(err, result) {
                    insert.energy = parseInt(result[0].energy);

                    callback(err);
                });
            },
            function(callback) {
                insert.value = insert.energy + person.energy;

                rest.query('UPDATE person_has_attribute SET value = ? WHERE person_id = ? AND attribute_id = ?', [insert.value, person.id, energy.id], callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });

    router.put(path + '/id/:id/bionic/:id2', function(req, res, next) {
        rest.personCustomDescription(req, res, next, req.params.id, 'bionic', req.params.id2, req.body.custom);
    });
};