var rest = require('./../rest');

module.exports = function(router, tableName, path) {
    path = path || '/' + tableName;

    var query = 'SELECT ' +
        'weapon.id, ' +
        'weapon.canon, ' +
        'weapon.popularity, ' +
        'weapon.name, ' +
        'weapon.description, ' +
        'weapon.species, ' +
        'weapon.augmentation, ' +
        'weapon.damage_bonus, ' +
        'weapon.price, ' +
        'weapon.legal, ' +
        'weapon.weapontype_id, ' +
        'weapontype.damage_dice, ' +
        'weapontype.critical_dice, ' +
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

    require('./../default')(router, tableName, query, {admin: false, user: true});

    router.get(path, function(req, res, next) {
        var call = query + ' WHERE ' +
            'weapon.canon = 1 AND ' +
            'weapon.species = 0 AND ' +
            'weapon.augmentation = 0 AND ' +
            'weapon.deleted IS NULL';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/type/:id', function(req, res, next) {
        var call = query + ' WHERE ' +
            'weapon.canon = 1 AND ' +
            'weapon.species = 0 AND ' +
            'weapon.augmentation = 0 AND ' +
            'weapon.weapontype_id = ? AND ' +
            'weapon.deleted IS NULL';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/species', function(req, res, next) {
        var call = query + ' WHERE ' +
            'weapon.canon = 1 AND ' +
            'weapon.species = 1 AND ' +
            'weapon.augmentation = 0 AND ' +
            'weapon.deleted IS NULL';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/augmentation', function(req, res, next) {
        var call = query + ' WHERE ' +
            'weapon.canon = 1 AND ' +
            'weapon.species = 0 AND ' +
            'weapon.augmentation = 1 AND ' +
            'weapon.deleted IS NULL';

        rest.GET(req, res, next, call, [req.params.id]);
    });
};