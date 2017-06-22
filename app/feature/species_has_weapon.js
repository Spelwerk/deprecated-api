var mysql = require('mysql'),
    rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM species_has_weapon' +
        'LEFT JOIN weapon ON weapon.id = species_has_weapon.weapon_id';

    router.get(path + '/id/:id/weapon', function(req, res, next) {
        var call = query + ' WHERE ' +
            'species_has_weapon.species_id = ?';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/weapon', function(req, res, next) {
        rest.relationPost(req, res, next, 'species', req.params.id, 'weapon', req.body.insert_id);
    });

    router.delete(path + '/id/:id/weapon/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'species', req.params.id, 'weapon', req.params.id2);
    });
};