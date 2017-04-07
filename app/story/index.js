module.exports = function(pool, router) {

    require('./story')(pool, router, 'story');
    // require('./story_has_npc')(pool, router, 'story_has_npc', '/story-npc');
    require('./story_has_person')(pool, router, 'story_has_person', '/story-person');
    require('./meeting')(pool, router, 'story-meeting');
    require('./location')(pool, router, 'story-location');

};