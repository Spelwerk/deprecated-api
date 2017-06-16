var rest = require('./../rest');

module.exports = function(router, path) {
    var query = 'SELECT * FROM asset_has_expertise ' +
        'LEFT JOIN expertise ON expertise.id = asset_has_expertise.expertise_id';

    router.get(path + '/id/:id/expertise', function(req, res, next) {
        var call = query + ' WHERE ' +
            'asset_has_expertise.asset_id = ?';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.post(path + '/id/:id/expertise', function(req, res, next) {
        rest.relationPostWithValue(req, res, next, 'asset', req.params.id, 'expertise', req.body.insert_id, req.body.value);
    });

    router.delete(path + '/id/:id/expertise/:id2', function(req, res, next) {
        rest.relationDelete(req, res, next, 'asset', req.params.id, 'expertise', req.params.id2);
    });
};