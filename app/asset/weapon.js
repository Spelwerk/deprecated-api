var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'weapon.id, ' +
        'weapon.canon, ' +
        'weapon.species, ' +
        'weapon.augmentation, ' +
        'weapon.name, ' +
        'weapon.description, ' +
        'weapon.price, ' +
        'weapon.legal, ' +
        'weapon.weapontype_id, ' +
        'weapontype.damage_d12, ' +
        'weapontype.damage_bonus, ' +
        'weapontype.critical_d12, ' +
        'weapontype.hand, ' +
        'weapontype.initiative, ' +
        'weapontype.hit, ' +
        'weapontype.distance, ' +
        'weapontype.weapongroup_id, ' +
        'weapongroup.special, ' +
        'weapongroup.skill_id, ' +
        'weapongroup.expertise_id, ' +
        'weapongroup.damage_id, ' +
        'weapongroup.icon ' +
        'FROM weapon ' +
        'LEFT JOIN weapontype ON weapontype.id = weapon.weapontype_id ' +
        'LEFT JOIN weapongroup ON weapongroup.id = weapontype.weapongroup_id';

    var allowedPost = ['name', 'description', 'price', 'legal', 'weapontype_id'];

    var allowedPut = ['name', 'description', 'price', 'legal', 'weapontype_id'];

    var allowsUser = true;

    require('./../default-protected')(pool, router, table, path, query, allowedPost, allowedPut, allowsUser);

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' +
            'weapon.canon = 1 AND ' +
            'weapon.species = 0 AND ' +
            'weapon.augmentation = 0 AND ' +
            'weapon.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/type/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'weapon.canon = 1 AND ' +
            'weapon.species = 0 AND ' +
            'weapon.augmentation = 0 AND ' +
            'weapon.weapontype_id = ? AND ' +
            'weapon.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/species', function(req, res) {
        var call = query + ' WHERE ' +
            'weapon.canon = 1 AND ' +
            'weapon.species = 1 AND ' +
            'weapon.augmentation = 0 AND ' +
            'weapon.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.get(path + '/augmentation', function(req, res) {
        var call = query + ' WHERE ' +
            'weapon.canon = 1 AND ' +
            'weapon.species = 0 AND ' +
            'weapon.augmentation = 1 AND ' +
            'weapon.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });
};