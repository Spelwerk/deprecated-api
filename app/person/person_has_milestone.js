var mysql = require('mysql'),
    async = require('async'),
    logger = require('./../logger'),
    rest = require('./../rest'),
    hasher = require('./../hasher');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'milestone.id, ' +
        'milestone.canon, ' +
        'milestone.name, ' +
        'milestone.description, ' +
        'person_has_milestone.custom, ' +
        'milestone.background_id, ' +
        'background.name AS background_name, ' +
        'milestone.species_id, ' +
        'species.name AS species_name, ' +
        'milestone.manifestation_id, ' +
        'manifestation.name AS manifestation_name, ' +
        'milestone.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'milestone.attribute_value, ' +
        'milestone.loyalty_id, ' +
        'loyalty.name AS loyalty_name, ' +
        'milestone.loyalty_occupation ' +
        'FROM person_has_milestone ' +
        'LEFT JOIN milestone ON milestone.id = person_has_milestone.milestone_id ' +
        'LEFT JOIN background ON background.id = milestone.background_id ' +
        'LEFT JOIN species ON species.id = milestone.species_id ' +
        'LEFT JOIN manifestation ON manifestation.id = milestone.manifestation_id ' +
        'LEFT JOIN attribute ON attribute.id = milestone.attribute_id ' +
        'LEFT JOIN loyalty ON loyalty.id = milestone.loyalty_id';

    router.get(path + '/id/:id/milestone', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_milestone.person_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"name": "ASC"});
    });

    router.post(path + '/id/:id/milestone', function(req, res) {
        var person = {},
            insert = {},
            current = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = req.body.milestone_id;

        async.waterfall([
            function(callback) {
                async.parallel([
                    function(callback) {
                        pool.query(mysql.format('SELECT secret FROM person WHERE id = ? AND secret = ?',[person.id,person.secret]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT attribute_id, value FROM person_has_attribute WHERE person_id = ?',[person.id]),callback);
                    },
                    function(callback) {
                        pool.query(mysql.format('SELECT attribute_id, attribute_value AS value FROM milestone WHERE id = ?',[insert.id]),callback);
                    }
                ],function(err,results) {
                    person.auth = !!results[0][0][0];
                    person.attribute = results[1][0];
                    insert.attribute = results[2][0];

                    callback(err,person,insert);
                });
            },
            function(person,insert,callback) {
                if(person.auth) {
                    async.parallel([
                        function(callback) {
                            pool.query(mysql.format('INSERT INTO person_has_milestone (person_id,milestone_id) VALUES (?,?)',[person.id,insert.id]),callback);
                        },
                        function(callback) {
                            rest.personInsertAttribute(pool, person, insert, current, callback);
                        }
                    ],function(err) {
                        callback(err);
                    });
                } else { callback(); }
            }
        ],function(err) {
            if(err) {
                console.log(err);
                res.status(500).send({header: 'Internal SQL Error', message: err, code: err.code});
            } else {
                res.status(200).send();
            }
        });
    });

    router.put(path + '/id/:id/milestone/:id2', function(req, res) {
        rest.personCustomDescription(pool, req, res, 'milestone');
    });

    router.delete(path + '/id/:id/milestone/:id2', function(req, res) {
        rest.personDeleteRelation(req, res, 'milestone');
    });
};