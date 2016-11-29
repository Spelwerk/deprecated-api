//var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'protectiontype.id, ' +
        'protectiontype.name, ' +
        'protectiontype.attribute_id, ' +
        'attribute.name AS attribute_name, ' +
        'protectiontype.created, ' +
        'protectiontype.deleted, ' +
        'protectiontype.updated ' +
        'FROM protectiontype ' +
        'LEFT JOIN attribute ON attribute.id = protectiontype.attribute_id';

    require('./../default')(pool, router, table, path, query);
};