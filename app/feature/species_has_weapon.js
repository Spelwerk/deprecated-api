var mysql = require('mysql'),
    rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM species_has_weapon' +
        'LEFT JOIN weapon ON weapon.id = species_has_weapon.weapon_id';

    router.get(path + '/id/:id/weapon', function(req, res) {
        var call = query + ' WHERE ' +
            'species_has_weapon.species_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"weapon_id": "ASC"});
    });

    router.post(path + '/id/:id/weapon', function(req, res) {
        rest.tablePostHas(pool, req, res, 'species', req.params.id, 'weapon');
    });

    router.delete(path + '/id/:id/weapon/:id2', function(req, res) {
        rest.tableDeleteHas(pool, req, res, 'species', req.params.id, 'weapon', req.params.id2);
    });
};