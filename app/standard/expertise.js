var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'expertise.id, ' +
        'expertise.name, ' +
        'expertise.description, ' +
        'expertise.hidden, ' +
        'expertisetype.maximum, ' +
        'expertise.expertisetype_id, ' +
        'expertisetype.name AS expertisetype_name, ' +
        'expertise.species_id, ' +
        'species.name AS species_name, ' +
        'expertise.manifestation_id, ' +
        'manifestation.name AS manifestation_name, ' +
        'expertise.skill_attribute_id, ' +
        'a1.name AS skill_attribute_name, ' +
        'expertise.give_attribute_id, ' +
        'a2.name AS give_attribute_name, ' +
        'expertise.created, ' +
        'expertise.deleted ' +
        'FROM expertise ' +
        'LEFT JOIN expertisetype ON expertisetype.id = expertise.expertisetype_id ' +
        'LEFT JOIN species ON species.id = expertise.species_id ' +
        'LEFT JOIN manifestation ON manifestation.id = expertise.manifestation_id ' +
        'LEFT JOIN attribute a1 ON a1.id = expertise.skill_attribute_id ' +
        'LEFT JOIN attribute a2 ON a2.id = expertise.give_attribute_id';

    router.get(path + '/help', function(req, res) {
        rest.HELP(pool, req, res, table);
    });

    router.get(path, function(req, res) {
        rest.QUERY(pool, req, res, query, null);
    });

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE expertise.id = ?';
        rest.QUERY(pool, req, res, call, [req.params.id]);
    });

    router.post(path, function(req, res) {
        rest.POST(pool, req, res, table);
    });

    router.put(path, function(req, res) {
        rest.INSERT(pool, req, res, table);
    });

    router.put(path + '/id/:id', function(req, res) {
        rest.PUT(pool, req, res, table);
    });

    router.delete(path + '/id/:id', function(req, res) {
        rest.DELETE(pool, req, res, table);
    });
};