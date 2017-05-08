module.exports = function(router) {

    require('./story')(router, 'story');
    require('./location')(router, 'story');

};