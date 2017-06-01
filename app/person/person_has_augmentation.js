var async = require('async'),
    energyId = require('./../config').defaults.attribute.id.energy,
    rest = require('./../rest');

module.exports = function(router, path) {
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
        'augmentationquality.price AS quality_price, ' +
        'augmentationquality.energy AS quality_energy ' +
        'FROM person_has_augmentation ' +
        'LEFT JOIN augmentation ON augmentation.id = person_has_augmentation.augmentation_id ' +
        'LEFT JOIN augmentationquality ON augmentationquality.id = person_has_augmentation.augmentationquality_id';

    router.get(path + '/id/:id/augmentation', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_has_augmentation.person_id = ?';

        rest.QUERY(req, res, next, call, [req.params.id], {"name": "ASC"});
    });

    router.get(path + '/id/:id/augmentation/bionic/:id2', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_has_augmentation.person_id = ? AND ' +
            'person_has_augmentation.bionic_id = ?';

        rest.QUERY(req, res, next, call, [req.params.id, req.params.id2]);
    });

    router.post(path + '/id/:id/augmentation', function(req, res, next) {
        var person = {},
            current = {},
            energy = {},
            insert = {};

        person.id = req.params.id;
        energy.id = energyId;
        insert.id = parseInt(req.body.insert_id);
        insert.bionic = parseInt(req.body.bionic_id);

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
                rest.query('SELECT skill_id, value FROM person_has_skill WHERE person_id = ?', [person.id], function(err, result) {
                    person.skill = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('SELECT attribute_id, value FROM augmentation_has_attribute WHERE augmentation_id = ?', [insert.id], function(err, result) {
                    insert.attribute = !!result[0] ? result : null;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('SELECT skill_id, value FROM augmentation_has_skill WHERE augmentation_id = ?', [insert.id], function(err, result) {
                    insert.skill = !!result[0] ? result : null;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('SELECT weapon_id FROM augmentation WHERE id = ?', [insert.id], function(err, result) {
                    insert.weapon = !!result[0] ? result[0].weapon_id : null;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('INSERT INTO person_has_augmentation (person_id,bionic_id,augmentation_id) VALUES (?,?,?)', [person.id, insert.bionic, insert.id], callback);
            },
            function(callback) {
                rest.personInsertAttribute(person, insert, current, callback);
            },
            function(callback) {
                rest.personInsertSkill(person, insert, current, callback);
            },
            function(callback) {
                if(!insert.weapon) return callback();

                rest.query('INSERT INTO person_has_weapon (person_id,weapon_id) VALUES (?,?)', [person.id, insert.weapon], callback);
            },
            function(callback) {
                rest.query('SELECT value FROM person_has_attribute WHERE person_id = ? AND attribute_id = ?', [person.id, energy.id], function(err, result) {
                    person.energy = parseInt(result[0].value);

                    callback(err);
                });
            },
            function(callback) {
                rest.query('SELECT energy FROM augmentation WHERE id = ?', [insert.id], function(err, result) {
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
};