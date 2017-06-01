var async = require('async'),
    rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT ' +
        'protection.id, ' +
        'protection.canon, ' +
        'protection.name, ' +
        'protection.description, ' +
        'protection.price, ' +
        'protection.bodypart_id, ' +
        'protection.icon, ' +
        'person_has_protection.protectionquality_id AS quality_id, ' +
        'protectionquality.price AS quality_price, ' +
        'protectionquality.bonus, ' +
        'person_has_protection.equipped, ' +
        'person_has_protection.custom ' +
        'FROM person_has_protection ' +
        'LEFT JOIN protection ON protection.id = person_has_protection.protection_id ' +
        'LEFT JOIN protectionquality ON protectionquality.id = person_has_protection.protectionquality_id';

    router.get(path + '/id/:id/protection', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_has_protection.person_id = ?';

        rest.QUERY(req, res, next, call, [req.params.id, req.params.id2], {"equipped": "DESC", "name": "ASC"});
    });

    router.get(path + '/id/:id/protection/equipped/:id2', function(req, res, next) {
        var call = query + ' WHERE ' +
            'person_has_protection.person_id = ? AND ' +
            'person_has_protection.equipped = ?';

        rest.QUERY(req, res, next, call, [req.params.id, req.params.id2]);
    });

    router.post(path + '/id/:id/protection', function(req, res, next) {
        rest.relationPost(req, res, next, req.params.id, 'protection', req.body.insert_id);
    });

    router.put(path + '/id/:id/protection/:id2', function(req, res, next) {
        rest.personCustomDescription(req, res, next, req.params.id, 'protection', req.params.id2, req.body.custom);
    });

    router.put(path + '/id/:id/protection/:id2/equip/:equip', function(req, res, next) {
        rest.personEquip(req, res, next, req.params.id, 'protection', req.params.id2, req.params.equip);
    });

    router.delete(path + '/id/:id/protection/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'person', req.params.id, 'protection', req.params.id2);
    });
};