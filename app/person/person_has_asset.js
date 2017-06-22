var async = require('async'),
    rest = require('./../rest');

function unequip(personId, assetId, callback) {
    var person = {},
        asset = {};

    person.id = personId;
    asset.id = assetId;
    asset.equip = 0;

    async.series([
        function (callback) {
            rest.query('UPDATE person_has_asset SET equipped = ? WHERE person_id = ? AND asset_id = ?', [asset.equip, person.id, asset.id], callback);
        },

        // ATTRIBUTE

        function (callback) {
            rest.query('SELECT attribute_id AS id, value FROM person_has_attribute WHERE person_id = ?', [person.id], function (err, result) {
                person.attribute = result;

                callback(err);
            });
        },
        function (callback) {
            rest.query('SELECT attribute_id AS id, value FROM asset_has_attribute WHERE asset_id = ?', [asset.id], function (err, result) {
                asset.attribute = result;

                callback(err);
            });
        },
        function (callback) {
            rest.personInsert('INSERT INTO person_has_attribute (person_id,attribute_id,value) VALUES ', person.id, person.attribute, null, asset.attribute, callback);
        },

        // SKILL

        function (callback) {
            rest.query('SELECT skill_id AS id, value FROM person_has_skill WHERE person_id = ?', [person.id], function (err, result) {
                person.skill = result;

                callback(err);
            });
        },
        function (callback) {
            rest.query('SELECT skill_id AS id, value FROM asset_has_skill WHERE asset_id = ?', [asset.id], function (err, result) {
                asset.skill = result;

                callback(err);
            });
        },
        function (callback) {
            rest.personInsert('INSERT INTO person_has_skill (person_id,skill_id,value) VALUES ', person.id, person.skill, null, asset.skill, callback);
        },

        // EXPERTISE

        function (callback) {
            rest.query('SELECT expertise_id AS id, value FROM person_has_expertise WHERE person_id = ?', [person.id], function (err, result) {
                person.expertise = result;

                callback(err);
            });
        },
        function (callback) {
            rest.query('SELECT expertise_id AS id, value FROM asset_has_expertise WHERE asset_id = ?', [asset.id], function (err, result) {
                asset.expertise = result;

                callback(err);
            });
        },
        function (callback) {
            rest.personInsert('INSERT INTO person_has_expertise (person_id,expertise_id,value) VALUES ', person.id, person.expertise, null, asset.expertise, callback);
        },

        // DOCTRINE

        function (callback) {
            rest.query('SELECT doctrine_id AS id, value FROM person_has_doctrine WHERE person_id = ?', [person.id], function (err, result) {
                person.doctrine = result;

                callback(err);
            });
        },
        function (callback) {
            rest.query('SELECT doctrine_id AS id, value FROM asset_has_doctrine WHERE asset_id = ?', [asset.id], function (err, result) {
                asset.doctrine = result;

                callback(err);
            });
        },
        function (callback) {
            rest.personInsert('INSERT INTO person_has_doctrine (person_id,doctrine_id,value) VALUES ', person.id, person.doctrine, null, asset.doctrine, callback);
        }
    ],function (err) {
        callback(err);
    });
}

module.exports = function(router, path) {
    var query = 'SELECT ' +
        'asset.id, ' +
        'asset.canon, ' +
        'asset.popularity, ' +
        'asset.name, ' +
        'asset.description, ' +
        'asset.price, ' +
        'asset.legal, ' +
        'asset.assettype_id, ' +
        'assettype.name AS assettype_name, ' +
        'assettype.icon, ' +
        'assettype.assetgroup_id, ' +
        'assetgroup.name, ' +
        'person_has_asset.value, ' +
        'person_has_asset.custom, ' +
        'person_has_asset.equipped ' +
        'FROM person_has_asset ' +
        'LEFT JOIN asset ON asset.id = person_has_asset.asset_id ' +
        'LEFT JOIN assettype ON assettype.id = asset.assettype_id ' +
        'LEFT JOIN assetgroup ON assetgroup.id = assettype.assetgroup_id';

    router.get(path + '/id/:id/asset', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_has_asset.person_id = ?';

        rest.GET(req, res, next, call, [req.params.id], {"name": "ASC"});
    });

    router.post(path + '/id/:id/asset', function(req, res, next) {
        rest.relationPost(req, res, next, 'person', req.params.id, 'asset', req.params.insert_id);
    });

    router.post(path + '/id/:id/asset/:asset/equip', function(req, res, next) {
        var person = {},
            asset = {};

        asset.equip = 1;

        person.id = req.params.id;
        asset.id = req.params.asset;

        async.series([
            function(callback) {
                rest.userAuth(req, false, 'person', person.id, callback);
            },
            function(callback) {
                rest.query('UPDATE person_has_asset SET equipped = ? WHERE person_id = ? AND asset_id = ?', [asset.equip, person.id, asset.id], callback);
            },

            // ATTRIBUTE

            function(callback) {
                rest.query('SELECT attribute_id AS id, value FROM person_has_attribute WHERE person_id = ?', [person.id], function(err, result) {
                    person.attribute = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('SELECT attribute_id AS id, value FROM asset_has_attribute WHERE asset_id = ?', [asset.id], function(err, result) {
                    asset.attribute = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.personInsert('INSERT INTO person_has_attribute (person_id,attribute_id,value) VALUES ', person.id, person.attribute, asset.attribute, null, callback);
            },

            // SKILL

            function(callback) {
                rest.query('SELECT skill_id AS id, value FROM person_has_skill WHERE person_id = ?', [person.id], function(err, result) {
                    person.skill = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('SELECT skill_id AS id, value FROM asset_has_skill WHERE asset_id = ?', [asset.id], function(err, result) {
                    asset.skill = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.personInsert('INSERT INTO person_has_skill (person_id,skill_id,value) VALUES ', person.id, person.skill, asset.skill, null, callback);
            },

            // EXPERTISE

            function(callback) {
                rest.query('SELECT expertise_id AS id, value FROM person_has_expertise WHERE person_id = ?', [person.id], function(err, result) {
                    person.expertise = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('SELECT expertise_id AS id, value FROM asset_has_expertise WHERE asset_id = ?', [asset.id], function(err, result) {
                    asset.expertise = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.personInsert('INSERT INTO person_has_expertise (person_id,expertise_id,value) VALUES ', person.id, person.expertise, asset.expertise, null, callback);
            },

            // DOCTRINE

            function(callback) {
                rest.query('SELECT doctrine_id AS id, value FROM person_has_doctrine WHERE person_id = ?', [person.id], function(err, result) {
                    person.doctrine = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('SELECT doctrine_id AS id, value FROM asset_has_doctrine WHERE asset_id = ?', [asset.id], function(err, result) {
                    asset.doctrine = result;

                    callback(err);
                });
            },
            function(callback) {
                rest.personInsert('INSERT INTO person_has_doctrine (person_id,doctrine_id,value) VALUES ', person.id, person.doctrine, asset.doctrine, null, callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });

    router.post(path + '/id/:id/asset/:asset/unequip', function(req, res, next) {
        async.series([
            function(callback) {
                rest.userAuth(req, false, 'person', req.params.id, callback);
            },
            function(callback) {
                unequip(req.params.id, req.params.asset, callback);
            }
        ],function(err) {
            if (err) return next(err);

            res.status(200).send();
        });
    });

    router.delete(path + '/id/:id/asset/:asset', function(req, res, next) {
        async.series([
            function(callback) {
                rest.userAuth(req, false, 'person', req.params.id, callback);
            },
            function(callback) {
                unequip(req.params.id, req.params.asset, callback);
            }
        ],function(err) {
            if (err) return next(err);

            rest.relationDelete(req, res, next, 'person', req.params.id, 'asset', req.params.asset);
        });
    });
};