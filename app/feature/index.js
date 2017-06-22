module.exports = function(router) {

    require('./attribute')(router, 'attribute', '/attribute');
    require('./attributetype')(router, 'attributetype', '/attributetype');
    require('./background')(router, 'background', '/background');
    require('./disease')(router, 'disease', '/disease');
    require('./doctrine')(router, 'doctrine', '/doctrine');
    require('./expertise')(router, 'expertise', '/expertise');
    require('./focus')(router, 'focus', '/focus');
    require('./gift')(router, 'gift', '/gift');
    require('./identity')(router, 'identity', '/identity');
    require('./imperfection')(router, 'imperfection', '/imperfection');
    require('./loyalty')(router, 'loyalty', '/loyalty');
    require('./manifestation')(router, 'manifestation', '/manifestation');
    require('./milestone')(router, 'milestone', '/milestone');
    require('./nature')(router, 'nature', '/nature');
    require('./sanity')(router, 'sanity', '/sanity');
    require('./skill')(router, 'skill', '/skill');
    require('./species')(router, 'species', '/species');
    require('./wound')(router, 'wound', '/wound');

};