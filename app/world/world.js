var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'world.name, ' +
        'world.description, ' +
        'world.template, ' +
        'world.popularity, ' +
        'world.supernatural, ' +
        'world.supernatural, ' +
        'world.supernatural, ' +
        'world.supernatural_attributetype_id, ' +
        'a1.name AS supernatural_attributetype_name, ' +
        'world.augmentation, ' +
        'world.skill_split, ' +
        'world.skill_attributetype_id, ' +
        'a2.name AS skill_attributetype_name, ' +
        'world.expertise_split, ' +
        'world.milestone_split, ' +
        'world.relationship_split, ' +
        'world.timeline_split, ' +
        'world.characteristic_max, ' +
        'world.created, ' +
        'world.deleted ' +
        'FROM world ' +
        'LEFT JOIN attributetype a1 ON a1.id = world.supernatural_attributetype_id ' +
        'LEFT JOIN attributetype a2 ON a2.id = world.skill_attributetype_id';

    require('./../default')(pool, router, table, path, query);
};