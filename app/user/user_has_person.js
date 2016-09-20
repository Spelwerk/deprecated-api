var rest = require('./../rest'),
    webtokens = require('./../webtokens');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'user_has_person.user_id, ' +
        'user_has_person.person_id, ' +
        'user_has_person.hash AS person_hash, ' +
        'person.name_nick AS person_name_nick, ' +
        'person.name_first AS person_name_first, ' +
        'person.name_last AS person_name_last, ' +
        'person.created, ' +
        'person.deleted ' +
        'FROM user_has_person ' +
        'LEFT JOIN person ON person.id = user_has_person.person_id';

    router.get(path, function(req, res) {
        var token = webtokens.validate(req),
            call = query + ' WHERE ' +
            'user_has_person.user_id = ? AND ' +
            'person.deleted is null';

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
            "person_id": req.params.id2
        };

        rest.REMOVE(pool, req, res, table, call);
    });
};