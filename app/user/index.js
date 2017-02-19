module.exports = function(pool, router) {

    require('./user')(pool, router, 'user');
    require('./user_has_person')(pool, router, 'user_has_person', '/user-person');
    require('./user_has_story')(pool, router, 'user_has_story', '/user-story');
    require('./user_has_world')(pool, router, 'user_has_world', '/user-world');
    require('./../default')(pool, router, 'permission');

};