var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'species.id AS species_id, ' +
        'species.name AS species_name, ' +
        'weapon.id AS weapon_id, ' +
        'weapon.name AS weapon_name ' +
        'FROM species_has_weapon ' +
        'LEFT JOIN species ON species.id = species_has_weapon.species_id ' +
        'LEFT JOIN weapon ON weapon.id = species_has_weapon.weapon_id';

    require('../default-has')(pool, router, table, path, ["species_id","weapon_id"]);

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'species_has_weapon.species_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"species_name": "ASC", "weapon_name": "ASC"});
    });
};