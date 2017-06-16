var async = require('async'),
    energyId = require('./../config').defaults.attribute.id.energy,
    rest = require('./../rest');

function deactivate(personId, augmentationId, bionicId, callback) {
    var person = {},
        energy = {},
        bionic = {},
        augmentation = {};

    person.id = personId;
    energy.id = energyId;
    bionic.id = bionicId;
    augmentation.id = augmentationId;
    augmentation.active = 0;

    async.series([
        function(callback) {
            rest.query('UPDATE person_has_augmentation SET active = ? WHERE person_id = ? AND bionic_id = ? AND augmentation_id = ?', [augmentation.active, person.id, bionic.id, augmentation.id], callback);
        },

        // ATTRIBUTE

        function(callback) {
            rest.query('SELECT attribute_id AS id, value FROM person_has_attribute WHERE person_id = ?', [person.id], function(err, result) {
                person.attribute = result;

                callback(err);
            });
        },
        function(callback) {
            rest.query('SELECT attribute_id AS id, value FROM augmentation_has_attribute WHERE augmentation_id = ?', [augmentation.id], function(err, result) {
                augmentation.attribute = result;

                callback(err);
            });
        },
        function(callback) {
            rest.personInsert('INSERT INTO person_has_attribute (person_id,attribute_id,value) VALUES ', person.id, person.attribute, null, augmentation.attribute, callback);
        },

        // SKILL

        function(callback) {
            rest.query('SELECT skill_id AS id, value FROM person_has_skill WHERE person_id = ?', [person.id], function(err, result) {
                person.skill = result;

                callback(err);
            });
        },
        function(callback) {
            rest.query('SELECT skill_id AS id, value FROM augmentation_has_skill WHERE augmentation_id = ?', [augmentation.id], function(err, result) {
                augmentation.skill = result;

                callback(err);
            });
        },
        function(callback) {
            rest.personInsert('INSERT INTO person_has_skill (person_id,skill_id,value) VALUES ', person.id, person.skill, null, augmentation.skill, callback);
        },

        // ENERGY

        function(callback) {
            rest.query('SELECT value FROM person_has_attribute WHERE person_id = ? AND attribute_id = ?', [person.id, energy.id], function(err, result) {
                person.energy = parseInt(result[0].value);

                callback(err);
            });
        },
        function(callback) {
            rest.query('SELECT energy FROM augmentation WHERE id = ?', [augmentation.id], function(err, result) {
                augmentation.energy = parseInt(result[0].energy);

                callback(err);
            });
        },
        function(callback) {
            energy.value = person.energy - augmentation.energy;

            rest.query('UPDATE person_has_attribute SET value = ? WHERE person_id = ? AND attribute_id = ?', [energy.value, person.id, energy.id], callback);
        },

        // WEAPON

        function(callback) {
            rest.query('SELECT weapon_id AS id FROM augmentation WHERE id = ?', [augmentation.id], function(err, result) {
                augmentation.weapon = result[0].id;

                callback(err);
            });
        },
        function(callback) {
            if(!augmentation.weapon) return callback();

            rest.query('DELETE FROM person_has_weapon WHERE person_id = ? AND weapon_id = ?', [person.id, augmentation.weapon], callback);
        }
    ],function (err) {
        callback(err);
    });
}

module.exports = function(router, path) {
    var query = 'SELECT ' +
        'augmentation.id, ' +
        'augmentation.canon, ' +
        'augmentation.popularity, ' +
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

    router.get(path + '/id/:id/augmentation/bionic/:bionic', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_has_augmentation.person_id = ? AND ' +
            'person_has_augmentation.bionic_id = ?';

        rest.QUERY(req, res, next, call, [req.params.id, req.params.bionic]);
    });

    router.post(path + '/id/:id/augmentation', function(req, res, next) {
        var person = {},
            insert = {};

        person.id = req.params.id;
        insert.id = req.body.insert_id;
        insert.bionic = req.body.bionic_id;

        async.series([
            function(callback) {
                rest.userAuth(req, false, 'person', req.params.id, callback);
            },
            function(callback) {
                rest.query('INSERT INTO person_has_augmentation (person_id,bionic_id,augmentation_id) VALUES (?,?,?)', [person.id, insert.bionic, insert.id], callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });

    router.post(path + '/id/:id/augmentation/:augmentation/bionic/:bionic/activate', function(req, res, next) {
        var person = {},
            energy = {},
            bionic = {},
            augmentation = {};

        augmentation.active = 1;

        person.id = req.params.id;
        energy.id = energyId;
        bionic.id = req.params.bionic;
        augmentation.id = req.params.augmentation;

        async.series([
            function(callback) {
                rest.userAuth(req, false, 'person', person.id, callback);
            },
            function(callback) {
                rest.query('UPDATE person_has_augmentation SET active = ? WHERE person_id = ? AND bionic_id = ? AND augmentation_id = ?', [augmentation.active, person.id, bionic.id, augmentation.id], callback);
            },

            // ATTRIBUTE

            function(callback) {
                rest.query('SELECT attribute_id AS id, value FROM person_has_attribute WHERE person_id = ?', [person.id], function(err, result) {
                    person.attribute = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('SELECT attribute_id AS id, value FROM augmentation_has_attribute WHERE augmentation_id = ?', [augmentation.id], function(err, result) {
                    augmentation.attribute = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.personInsert('INSERT INTO person_has_attribute (person_id,attribute_id,value) VALUES ', person.id, person.attribute, augmentation.attribute, null, callback);
            },

            // SKILL

            function(callback) {
                rest.query('SELECT skill_id AS id, value FROM person_has_skill WHERE person_id = ?', [person.id], function(err, result) {
                    person.skill = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('SELECT skill_id AS id, value FROM augmentation_has_skill WHERE augmentation_id = ?', [augmentation.id], function(err, result) {
                    augmentation.skill = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.personInsert('INSERT INTO person_has_skill (person_id,skill_id,value) VALUES ', person.id, person.skill, augmentation.skill, null, callback);
            },

            // ENERGY

            function(callback) {
                rest.query('SELECT value FROM person_has_attribute WHERE person_id = ? AND attribute_id = ?', [person.id, energy.id], function(err, result) {
                    person.energy = parseInt(result[0].value);

                    callback(err);
                });
            },
            function(callback) {
                rest.query('SELECT energy FROM augmentation WHERE id = ?', [augmentation.id], function(err, result) {
                    augmentation.energy = parseInt(result[0].energy);

                    callback(err);
                });
            },
            function(callback) {
                energy.value = person.energy + augmentation.energy;

                rest.query('UPDATE person_has_attribute SET value = ? WHERE person_id = ? AND attribute_id = ?', [energy.value, person.id, energy.id], callback);
            },

            // WEAPON

            function(callback) {
                rest.query('SELECT weapon_id AS id FROM augmentation WHERE id = ?', [augmentation.id], function(err, result) {
                    augmentation.weapon = result[0].id;

                    callback(err);
                });
            },
            function(callback) {
                if(!augmentation.weapon) return callback();

                rest.query('INSERT INTO person_has_weapon (person_id,weapon_id) VALUES (?,?)', [person.id, augmentation.weapon], callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });

    router.post(path + '/id/:id/augmentation/:augmentation/bionic/:bionic/deactivate', function(req, res, next) {
        async.series([
            function(callback) {
                rest.userAuth(req, false, 'person', person.id, callback);
            },
            function(callback) {
                deactivate(req.params.id, req.params.augmentation, req.params.bionic, callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });

    router.delete(path + '/id/:id/augmentation/:augmentation', function(req, res, next) {
        async.series([
            function(callback) {
                rest.userAuth(req, false, 'person', req.params.id, callback);
            },
            function(callback) {
                deactivate(req.params.id, req.params.augmentation, req.params.bionic, callback);
            }
        ],function(err) {
            if(err) return next(err);

            rest.relationDelete(req, res, next, 'person', req.params.id, 'augmentation', req.params.augmentation);
        });
    });
};