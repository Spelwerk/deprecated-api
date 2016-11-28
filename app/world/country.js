var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'country.id, ' +
        'country.name, ' +
        'country.description, ' +
        'country.language_id, ' +
        'language.name AS language_name, ' +
        'language.firstnamegroup_id, ' +
        'language.surnamegroup_id, ' +
        'country.created, ' +
        'country.deleted, ' +
        'country.updated ' +
        'FROM country ' +
        'LEFT JOIN language ON language.id = country.language_id';

    require('./../default')(pool, router, table, path, query);
};