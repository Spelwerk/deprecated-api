var rest = require('./../rest');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT ' +
        'promotional.id, ' +
        'promotional.title, ' +
        'promotional.content, ' +
        'promotional.start, ' +
        'promotional.end, ' +
        'promotional.user_id, ' +
        'user.username AS user_username, ' +
        'promotional.created ' +
        'FROM promotional ' +
        'LEFT JOIN user ON user.id = promotional.user_id';

    require('./../default')(pool, router, table, path, query);
};