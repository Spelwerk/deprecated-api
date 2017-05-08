module.exports = function(router) {

    require('./asset/index')(router);
    require('./companion/index')(router);
    require('./feature/index')(router);
    require('./npc/index')(router);
    require('./person/index')(router);
    require('./site/index')(router);
    require('./story/index')(router);
    require('./user/index')(router);
    require('./world/index')(router);

};