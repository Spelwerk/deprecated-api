var mysql = require('mysql'),
    rest = require('./../rest');

module.exports = function(router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM species_has_weapon' +
        'LEFT JOIN weapon ON weapon.id = species_has_weapon.weapon_id';

    router.get(path + '/id/:id/weapon', function(req, res) {
        var call = query + ' WHERE ' +
            'species_has_weapon.species_id = ?';

        rest.QUERY(req, res, call, [req.params.id], {"weapon_id": "ASC"});
    });

    router.post(path + '/id/:id/weapon', function(req, res) {
        rest.relationPost(req, res, 'species', 'weapon');
    });

    router.delete(path + '/id/:id/weapon/:id2', function(req, res) {
        rest.relationDelete(req, res, 'species', 'weapon');
    });
};