var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'user_has_story.user_id, ' +
        'user_has_story.story_id, ' +
        'user_has_story.hash AS story_hash, ' +
        'story.name AS story_name, ' +
        'story.world_id, ' +
        'world.name AS world_name, ' +
        'story.created, ' +
        'story.deleted ' +
        'FROM user_has_story ' +
        'LEFT JOIN story ON story.id = user_has_story.story_id ' +
        'LEFT JOIN world ON world.id = story.world_id';

    router.get(path + '/id/:id/story', function(req, res) {
        var call = query + ' WHERE ' +
            'user_has_story.user_id = ? AND ' +
            'story.deleted IS NULL';

        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path + '/id/:id/story', function(req, res) {
        rest.userRelationPost(pool, req, res, 'story');
    });

    router.delete(path + '/id/:id/story/:id2', function(req, res) {
        rest.userRelationDelete(pool, req, res, 'story');
    });
};