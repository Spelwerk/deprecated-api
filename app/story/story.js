//var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'story.id, ' +
        'story.name, ' +
        'story.description, ' +
        'story.world_id, ' +
        'world.name AS world_name, ' +
        'story.created, ' +
        'story.deleted, ' +
        'story.updated ' +
        'FROM story ' +
        'LEFT JOIN world ON world.id = story.world_id';

    require('./../default-hash')(pool, router, table, path, query);
};