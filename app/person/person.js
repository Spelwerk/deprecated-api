var rest = require('./../rest'),
    hasher = require('./../hasher');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'id, hash, template, popularity, nickname, firstname, surname, cheated, supernatural, calculated, age, occupation, ' +
        'gender, description, behaviour, appearance, features, personality, ' +
        'point_supernatural, point_power, point_money, point_skill, point_expertise, point_milestone_upbringing, ' +
        'point_milestone_flexible, point_characteristic_gift, point_characteristic_imperfection, point_relationship, ' +
        'world_id, species_id, caste_id, nature_id, identity_id, country_id, manifestation_id, focus_id, ' +
        'created, deleted, updated ' +
        'FROM person';

    require('./../default-hash')(pool, router, table, path, query);

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' +
            'person.deleted IS NULL AND ' +
            'person.cheated = \'0\' AND ' +
            'person.template = \'0\'';

        rest.QUERY(pool, req, res, call, null, {"popularity": "DESC", "nickname": "ASC"});
    });

    router.get(path + '/template', function(req, res) {
        var call = query + ' WHERE ' +
            'person.deleted IS NULL AND ' +
            'person.cheated = \'0\' AND ' +
            'person.template = \'1\'';

        rest.QUERY(pool, req, res, call, null, {"popularity": "DESC", "nickname": "ASC"});
    });
};