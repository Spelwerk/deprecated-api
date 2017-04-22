module.exports = function(pool, router) {

    require('./story')(pool, router, 'story');
    require('./location')(pool, router, 'story');

};