module.exports = function(pool, router) {

    require('./asset/index')(pool, router);
    require('./companion/index')(pool, router);
    require('./feature/index')(pool, router);
    require('./npc/index')(pool, router);
    require('./person/index')(pool, router);
    require('./site/index')(pool, router);
    require('./story/index')(pool, router);
    require('./user/index')(pool, router);
    require('./world/index')(pool, router);

};