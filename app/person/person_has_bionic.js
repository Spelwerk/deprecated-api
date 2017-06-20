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
        'bionic.legal, ' +
        'bionic.bodypart_id, ' +
        'bionic.icon, ' +
        'person_has_bionic.custom ' +
        'FROM person_has_bionic ' +
        'LEFT JOIN bionic ON bionic.id = person_has_bionic.bionic_id';

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
            insert = {};

        person.id = req.params.id;
        energy.id = energyId;
        insert.id = parseInt(req.body.insert_id);

        async.series([
            function(callback) {
                rest.userAuth(req, false, 'person', req.params.id, callback);
            },
            function(callback) {
                rest.query('INSERT INTO person_has_bionic (person_id,bionic_id) VALUES (?,?)', [person.id, insert.id], callback);
            },

            // ATTRIBUTE

            function(callback) {
                rest.query('SELECT attribute_id AS id, value FROM person_has_attribute WHERE person_id = ?', [person.id], function(err, result) {
                    person.attribute = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('SELECT attribute_id AS id, value FROM bionic_has_attribute WHERE bionic_id = ?', [insert.id], function(err, result) {
                    insert.attribute = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.personInsert('INSERT INTO person_has_attribute (person_id,attribute_id,value) VALUES ', person.id, person.attribute, insert.attribute, null, callback);
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