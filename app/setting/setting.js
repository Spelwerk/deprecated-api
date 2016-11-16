var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'setting.name, ' +
        'setting.description, ' +
        'setting.template, ' +
        'setting.popularity, ' +
        'setting.supernatural, ' +
        'setting.supernatural, ' +
        'setting.supernatural, ' +
        'setting.supernatural_attributetype_id, ' +
        'a1.name AS supernatural_attributetype_name, ' +
        'setting.augmentation, ' +
        'setting.skill_split, ' +
        'setting.skill_attributetype_id, ' +
        'a2.name AS skill_attributetype_name, ' +
        'setting.expertise_split, ' +
        'setting.milestone_split, ' +
        'setting.relationship_split, ' +
        'setting.timeline_split, ' +
        'setting.characteristic_max, ' +
        'setting.created, ' +
        'setting.deleted ' +
        'FROM setting ' +
        'LEFT JOIN attributetype a1 ON a1.id = setting.supernatural_attributetype_id ' +
        'LEFT JOIN attributetype a2 ON a2.id = setting.skill_attributetype_id';

    require('./../default')(pool, router, table, path, query);
};