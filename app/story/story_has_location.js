var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM story_has_location ' +
        'LEFT JOIN location ON location.id = story_has_location.location_id';

    router.get(path + '/id/:id/location', function(req, res, next) {
        var call = query + ' WHERE ' +
            'story_has_location.story_id = ?';

        rest.GET(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/location', function(req, res, next) {
        rest.relationPost(req, res, next, 'story', req.params.id, 'location', req.body.insert_id);
    });

    router.delete(path + '/id/:id/location/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'story', req.params.id, 'location', req.params.id2);
    });
};