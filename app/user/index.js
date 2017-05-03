module.exports = function(pool, router) {

    require('./user')(pool, router, 'user');

};