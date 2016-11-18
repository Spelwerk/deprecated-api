var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'world.name, ' +
        'world.description, ' +
        'world.popularity, ' +
        'world.template, ' +
        'world.augmentation, ' +
        'world.supernatural, ' +
        'world.supernatural_name, ' +
        'world.supernatural_attributetype_id, ' +
        'a1.name AS supernatural_attributetype_name, ' +
        'world.skill_attributetype_id, ' +
        'a2.name AS skill_attributetype_name, ' +
        'world.split_supernatural, ' +
        'world.split_skill, ' +
        'world.split_expertise, ' +
        'world.split_milestone, ' +
        'world.split_relationship, ' +
        'world.split_timeline, ' +
        'world.max_characteristic, ' +
        'world.created, ' +
        'world.deleted ' +
        'FROM world ' +
        'LEFT JOIN attributetype a1 ON a1.id = world.supernatural_attributetype_id ' +
        'LEFT JOIN attributetype a2 ON a2.id = world.skill_attributetype_id';

    require('./../default')(pool, router, table, path, query);
};