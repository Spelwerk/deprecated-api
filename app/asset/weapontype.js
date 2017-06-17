var rest = require('./../rest');

module.exports = function(router, tableName, path) {
    path = path || '/' + tableName;

    var query = 'SELECT ' +
        'weapontype.id, ' +
        'weapontype.canon, ' +
        'weapontype.popularity, ' +
        'weapontype.name, ' +
        'weapontype.description, ' +
        'weapontype.damage_d12, ' +
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
        'FROM weapontype ' +
        'LEFT JOIN weapongroup ON weapongroup.id = weapontype.weapongroup_id';

    require('./../default')(router, tableName, query, {admin: false, user: true});

    router.get(path, function(req, res, next) {
        var call = query + ' WHERE ' +
            'weapontype.canon = 1 AND ' +
            'weapongroup.special = 0 AND ' +
            'weapontype.deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/group/:id', function(req, res, next) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'weapongroup_id = ? AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/special', function(req, res, next) {
        var call = query + ' WHERE ' +
            'canon = 1 AND ' +
            'weapongroup.special = 1 AND ' +
            'deleted IS NULL';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });
};