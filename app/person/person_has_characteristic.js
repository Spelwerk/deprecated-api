var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'characteristic.id, ' +
        'characteristic.name, ' +
        'characteristic.description, ' +
        'characteristic.gift, ' +
        'characteristic.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'characteristic.attribute_value, ' +
        'icon.path AS icon_path ' +
        'FROM person_has_characteristic ' +
        'LEFT JOIN characteristic ON characteristic.id = person_has_characteristic.characteristic_id ' +
        'LEFT JOIN attribute ON attribute.id = characteristic.attribute_id ' +
        'LEFT JOIN icon ON icon.id = characteristic.icon_id';

    require('../default-has')(pool, router, table, path, ["person_id","characteristic_id"]);

    router.get(path + '/id/:id1/gift/:id2', function(req, res) {
        var call = query + ' WHERE ' +
            'person_has_characteristic.person_id = ? AND ' +
            'characteristic.gift = ?';

        rest.QUERY(pool, req, res, call, [req.params.id1,req.params.id2], {"gift": "DESC", "name": "ASC"});
    });
};