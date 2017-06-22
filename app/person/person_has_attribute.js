var async = require('async'),
    rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT ' +
        'attribute.id, ' +
        'attribute.canon, ' +
        'attribute.name, ' +
        'attribute.description, ' +
        'attribute.attributetype_id, ' +
        'attribute.icon, ' +
        'attributetype.maximum, ' +
        'person_has_attribute.value ' +
        'FROM person_has_attribute ' +
        'LEFT JOIN attribute ON attribute.id = person_has_attribute.attribute_id ' +
        'LEFT JOIN attributetype ON attributetype.id = attribute.attributetype_id';

    router.get(path + '/id/:id/attribute', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_has_attribute.person_id = ?';

        rest.GET(req, res, next, call, [req.params.id], {"name": "ASC"});
    });

    router.get(path + '/id/:id/attribute/id/:id2', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_has_attribute.person_id = ? AND ' +
            'person_has_attribute.attribute_id = ?';

        rest.GET(req, res, next, call, [req.params.id, req.params.id2]);
    });

    router.get(path + '/id/:id/attribute/type/:id2', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_has_attribute.person_id = ? AND ' +
            'attribute.attributetype_id = ?';

        rest.GET(req, res, next, call, [req.params.id, req.params.id2]);
    });

    router.post(path + '/id/:id/attribute', function(req, res, next) {
        rest.relationPostWithValue(req, res, next, 'person', req.params.id, 'attribute', req.body.insert_id, req.body.value);
    });

    router.put(path + '/id/:id/attribute', function(req, res, next) {
        var person = {},
            insert = {},
            current = {};

        person.id = req.params.id;
        person.secret = req.body.secret;

        insert.id = parseInt(req.body.insert_id);
        insert.value = parseInt(req.body.value);

        async.series([
            function(callback) {
                rest.userAuth(req, false, 'person', req.params.id, callback);
            },
            function(callback) {
                rest.query('SELECT value FROM person_has_attribute WHERE person_id = ? AND attribute_id = ?', [person.id, insert.id], function(err, result) {
                    current.value = !!result[0] ? parseInt(result[0].value) : 0;

                    insert.value = insert.value + current.value;

                    callback(err);
                });
            },
            function(callback) {
                rest.query('INSERT INTO person_has_attribute (person_id,attribute_id,value) VALUES (?,?,?) ON DUPLICATE KEY UPDATE value = VALUES(value)', [person.id, insert.id, insert.value], callback);
            }
        ],function(err) {
            if(err) return next(err);

            res.status(200).send();
        });
    });
};