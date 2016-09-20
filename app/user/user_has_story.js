var rest = require('./../rest'),
    webtokens = require('./../webtokens');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'user_has_story.user_id, ' +
        'user_has_story.story_id, ' +
        'user_has_story.hash AS story_hash, ' +
        'story.name AS story_name, ' +
        'story.setting_id, ' +
        'setting.name AS setting_name, ' +
        'story.created, ' +
        'story.deleted ' +
        'FROM user_has_story ' +
        'LEFT JOIN story ON story.id = user_has_story.story_id ' +
        'LEFT JOIN setting ON setting.id = story.setting_id';

    router.get(path, function(req, res) {
        console.log(1);
        var token = webtokens.validate(req),
            call = query + ' WHERE ' +
            'user_has_story.user_id = ? AND ' +
            'story.deleted is null';

        rest.QUERY(pool, req, res, call, [token.sub.id]);
    });

    router.post(path, function(req, res) {
        var token = webtokens.validate(req);
        req.body.user_id = token.sub.id;

        rest.INSERT(pool, req, res, table, req.body);
    });

    router.delete(path + '/id/:id1/id/:id2', function(req, res) {
        var call = {
            "user_id": req.params.id1,
            "story_id": req.params.id2
        };

        rest.REMOVE(pool, req, res, table, call);
    });
};