module.exports = function(router) {

    require('./attribute')(router, 'attribute');
    require('./attributetype')(router, 'attributetype');
    require('./background')(router, 'background');
    require('./disease')(router, 'disease');
    require('./doctrine')(router, 'doctrine');
    require('./expertise')(router, 'expertise');
    require('./focus')(router, 'focus');
    require('./gift')(router, 'gift');
    require('./identity')(router, 'identity');
    require('./imperfection')(router, 'imperfection');
    require('./loyalty')(router, 'loyalty');
    require('./manifestation')(router, 'manifestation');
    require('./milestone')(router, 'milestone');
    require('./nature')(router, 'nature');
    require('./sanity')(router, 'sanity');
    require('./skill')(router, 'skill');
    require('./species')(router, 'species');
    require('./wound')(router, 'wound');

};