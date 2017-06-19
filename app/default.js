var rest = require('./rest'),
    base = require('./base');

module.exports = function(router, tableName, query, options) {
    query = query || 'SELECT * FROM ' + tableName;

    var path = '/' + tableName;

    // GET

    router.get(path + '/id/:id', function(req, res, next) {
        var call = query + ' WHERE ' + tableName + '.id = ?';

        rest.QUERY(req, res, next, call, [req.params.id]);
    });

    router.get(path + '/id/:id/isOwner', function(req, res, next) {
        rest.userVerifyOwner(req, res, next, tableName, req.params.id);
    });

    router.get(path + '/all', function(req, res, next) {
        rest.QUERY(req, res, next, query);
    });

    router.get(path + '/deleted', function(req, res, next) {
        var call = query + ' WHERE ' + tableName + '.deleted is NOT NULL';

        rest.QUERY(req, res, next, call);
    });

    // POST

    router.post(path, function(req, res, next) {
        var adminRequired = options.admin || true,
            userSave = options.user || false;

        rest.POST(req, res, next, adminRequired, userSave, tableName);
    });

    router.post(path + '/id/:id/clone', function(req, res, next) {
        rest.CLONE(req, res, next, false, 'person', req.params.id);
    });

    // PUT

    router.put(path + '/id/:id', function(req, res, next) {
        var adminRequired = options.admin || true;

        rest.PUT(req, res, next, adminRequired, tableName, req.params.id);
    });

    router.put(path + '/id/:id/canon', function(req, res, next) {
        rest.CANON(req, res, next, tableName, req.params.id);
    });

    router.put(path + '/id/:id/revive', function(req, res, next) {
        rest.REVIVE(req, res, next, tableName, req.params.id);
    });

    // DELETE

    router.delete(path + '/id/:id', function(req, res, next) {
        var adminRequired = options.admin || true;

        rest.DELETE(req, res, next, adminRequired, tableName, req.params.id);
    });

    // COMMENTS

    router.get(path + '/id/:id/comment', function(req, res, next) {
        rest.getComments(req, res, next, tableName, req.params.id);
    });

    router.post(path + '/id/:id/comment', function(req, res, next) {
        rest.postComment(req, res, next, tableName, req.params.id);
    });
};