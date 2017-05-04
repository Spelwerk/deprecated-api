var async = require('async'),
    energyId = require('./../config').defaults.attribute.id.energy,
    rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'augmentation.id, ' +
        'augmentation.canon, ' +
        'augmentation.name, ' +
        'augmentation.description, ' +
        'augmentation.price, ' +
        'augmentation.energy, ' +
        'augmentation.legal, ' +
        'augmentation.weapon_id, ' +
        'person_has_augmentation.augmentationquality_id AS quality_id, ' +
        'augmentationquality.energy AS quality_energy ' +
        'FROM person_has_augmentation ' +
        'LEFT JOIN augmentation ON augmentation.id = person_has_augmentation.augmentation_id ' +
        'LEFT JOIN augmentationquality ON augmentationquality.id = person_has_augmentation.augmentationquality_id';

    router.get(path + '/id/:id/augmentation', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_augmentation.person_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"bionic_id":"ASC"});
    });

    router.get(path + '/id/:id/augmentation/bionic/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_augmentation.person_id = ? AND ' +
            'person_has_augmentation.bionic_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id, req.params.id2]);
    });

    router.post(path + '/id/:id/augmentation', function(req, res) {
        var person = {},
            current = {},
            energy = {},
            insert = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        energy.id = energyId;

        insert.id = parseInt(req.body.insert_id);
        insert.bionic = parseInt(req.body.bionic_id);

        async.series([
            function(callback) {
                rest.personAuth(pool, person, callback);
            },
            function(callback) {
                rest.query(pool, 'SELECT attribute_id, value FROM person_has_attribute WHERE person_id = ?', [person.id], function(err, result) {
                    person.attribute = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.query(pool, 'SELECT skill_id, value FROM person_has_skill WHERE person_id = ?', [person.id], function(err, result) {
                    person.skill = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.query(pool, 'SELECT attribute_id, value FROM augmentation_has_attribute WHERE augmentation_id = ?', [insert.id], function(err, result) {
                    insert.attribute = !!result[0] ? result : null;

                    callback(err);
                });
            },
            function(callback) {
                rest.query(pool, 'SELECT skill_id, value FROM augmentation_has_skill WHERE augmentation_id = ?', [insert.id], function(err, result) {
                    insert.skill = !!result[0] ? result : null;

                    callback(err);
                });
            },
            function(callback) {
                rest.query(pool, 'SELECT weapon_id FROM augmentation WHERE id = ?', [insert.id], function(err, result) {
                    insert.weapon = !!result[0] ? result[0].weapon_id : null;

                    callback(err);
                });
            },
            function(callback) {
                rest.query(pool, 'INSERT INTO person_has_augmentation (person_id,bionic_id,augmentation_id) VALUES (?,?,?)', [person.id, insert.bionic, insert.id], callback);
            },
            function(callback) {
                rest.personInsertAttribute(pool, person, insert, current, callback);
            },
            function(callback) {
                rest.personInsertSkill(pool, person, insert, current, callback);
            },
            function(callback) {
                if(!insert.weapon) { callback(); } else {
                    rest.query(pool, 'INSERT INTO person_has_weapon (person_id,weapon_id) VALUES (?,?)', [person.id, insert.weapon], callback);
                }
            },
            function(callback) {
                rest.query(pool, 'SELECT value FROM person_has_attribute WHERE person_id = ? AND attribute_id = ?', [person.id, energy.id], function(err, result) {
                    if(err) return callback(err);

                    person.energy = parseInt(result[0].value);

                    callback();
                });
            },
            function(callback) {
                rest.query(pool, 'SELECT energy FROM augmentation WHERE id = ?', [insert.id], function(err, result) {
                    if(err) return callback(err);

                    insert.energy = parseInt(result[0].energy);

                    callback();
                });
            },
            function(callback) {
                insert.value = insert.energy + person.energy;

                rest.query(pool, 'UPDATE person_has_attribute SET value = ? WHERE person_id = ? AND attribute_id = ?', [insert.value, person.id, energy.id], callback);
            }
        ],function(err) {
            if(err) {
                var status = err.status ? err.status : 500;
                res.status(status).send({code: err.code, message: err.message});
            } else {
                res.status(200).send();
            }
        });
    });
};