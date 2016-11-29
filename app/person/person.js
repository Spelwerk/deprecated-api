var rest = require('./../rest'),
    hasher = require('./../hasher');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'person.id, ' +
        'person.hash, ' +
        'person.template, ' +
        'person.popularity, ' +

        'person.nickname, ' +
        'person.firstname, ' +
        'person.surname, ' +

        'person.cheated, ' +
        'person.supernatural, ' +

        'person.age, ' +
        'person.occupation, ' +
        'person.gender, ' +

        'person.description, ' +
        'person.behaviour, ' +
        'person.appearance, ' +
        'person.features, ' +
        'person.personality, ' +

        'person.world_id, ' +
        'world.name AS world_name, ' +
        'world.description AS world_description, ' +
        'world.supernatural_name AS world_supernatural_name, ' +
        'world.consumable_attributetype_id AS world_consumable_attributetype_id, ' +
        'world.skill_attributetype_id AS world_skill_attributetype_id, ' +
        'world.supernatural_attributetype_id AS world_supernatural_attributetype_id, ' +
        'world.hitpoints_attributetype_id AS world_hitpoints_attributetype_id, ' +

        'person.species_id, ' +
        'species.name AS species_name, ' +
        'species.description AS species_description, ' +
        'i1.path AS species_icon_path, ' +

        'person.caste_id, ' +
        'caste.name AS caste_name, ' +
        'caste.description AS caste_description, ' +
        'i2.path AS caste_icon_path, ' +

        'person.nature_id, ' +
        'nature.name AS nature_name, ' +
        'nature.description AS nature_description, ' +
        'i3.path AS nature_icon_path, ' +

        'person.identity_id, ' +
        'identity.name AS identity_name, ' +
        'identity.description AS identity_description, ' +
        'i4.path AS identity_icon_path, ' +

        'person.country_id, ' +
        'country.name AS country_name, ' +

        'person.manifestation_id, ' +
        'manifestation.name AS manifestation_name, ' +
        'manifestation.description AS manifestation_description, ' +
        'manifestation.attributetype_id, ' +
        'attributetype.name AS attributetype_name, ' +
        'manifestation.expertisetype_id, ' +
        'expertisetype.name AS expertisetype_name, ' +
        'i5.name AS manifestation_icon_path, ' +

        'person.focus_id, ' +
        'focus.name AS focus_name, ' +
        'focus.description AS focus_description, ' +
        'i6.name AS focus_icon_path, ' +

        'person.created, ' +
        'person.deleted, ' +
        'person.updated ' +

        'FROM person ' +

        'LEFT JOIN world ON world.id = person.world_id ' +
        'LEFT JOIN species ON species.id = person.species_id ' +
        'LEFT JOIN caste ON caste.id = person.caste_id ' +
        'LEFT JOIN nature ON nature.id = person.nature_id ' +
        'LEFT JOIN identity ON identity.id = person.identity_id ' +
        'LEFT JOIN country ON country.id = person.country_id ' +
        'LEFT JOIN manifestation ON manifestation.id = person.manifestation_id ' +
        'LEFT JOIN attributetype ON attributetype.id = manifestation.attributetype_id ' +
        'LEFT JOIN expertisetype ON expertisetype.id = manifestation.expertisetype_id' +
        'LEFT JOIN focus ON focus.id = person.focus_id ' +
        'LEFT JOIN icon i1 ON i1.id = species.icon_id ' +
        'LEFT JOIN icon i2 ON i2.id = caste.icon_id ' +
        'LEFT JOIN icon i3 ON i3.id = nature.icon_id ' +
        'LEFT JOIN icon i4 ON i4.id = identity.icon_id ' +
        'LEFT JOIN icon i5 ON i5.id = manifestation.icon_id ' +
        'LEFT JOIN icon i6 ON i6.id = focus.icon_id';

    require('./../default-hash')(pool, router, table, path, query);

    router.get(path, function(req, res) {
        var call = query + ' WHERE ' +
            'person.deleted IS NULL AND ' +
            'person.cheated = \'0\' AND ' +
            'person.template = \'0\'';

        rest.QUERY(pool, req, res, call, null, {"popularity": "DEC", "nickname": "ASC"});
    });

    router.get(path + '/template', function(req, res) {
        var call = query + ' WHERE ' +
            'person.deleted IS NULL AND ' +
            'person.cheated = \'0\' AND ' +
            'person.template = \'1\'';

        rest.QUERY(pool, req, res, call, null, {"popularity": "DEC", "nickname": "ASC"});
    });
};