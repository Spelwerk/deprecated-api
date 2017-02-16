var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'id, hash, template, popularity, hidden, name, description, ' +
        'bionic, augmentation, software, supernatural, supernatural_name, ' +
        'skill_attributetype_id, attribute_expertisetype_id, dice_expertisetype_id, money_attribute_id, ' +
        'split_supernatural, split_skill, split_expertise, split_milestone, split_relationship, ' +
        'max_characteristic_gift, max_characteristic_imperfection, max_supernatural, max_skill, max_expertise, ' +
        'max_milestone_upbringing, max_milestone_flexible, max_relationship, ' +
        'created, deleted, updated ' +
        'FROM world';

    require('./../default-hash')(pool, router, table, path, query);

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' +
            'world.deleted IS NULL AND ' +
            'world.template = ? AND ' +
            'world.hidden = ?';

        rest.QUERY(pool, req, res, call, [0,0], {"popularity": "DESC", "name": "ASC"});
    });

    router.get(path + '/template', function(req, res) {
        var call = query + ' WHERE ' +
            'world.deleted IS NULL AND ' +
            'world.template = ? AND ' +
            'world.hidden = ?';

        rest.QUERY(pool, req, res, call, [1,0], {"popularity": "DESC", "name": "ASC"});
    });
};