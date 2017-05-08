module.exports = function(router) {

    require('./attribute')(router, 'attribute');
    require('./../default')(router, 'attributetype');
    require('./../default')(router, 'bodypart');
    require('./background')(router, 'background');
    require('./../default')(router, 'disease');
    require('./doctrine')(router, 'doctrine');
    require('./expertise')(router, 'expertise');
    require('./focus')(router, 'focus');
    require('./gift')(router, 'gift');
    require('./../default')(router, 'identity');
    require('./imperfection')(router, 'imperfection');
    require('./../default')(router, 'loyalty');
    require('./manifestation')(router, 'manifestation');
    require('./milestone')(router, 'milestone');
    require('./../default')(router, 'nature');
    require('./../default')(router, 'sanity');
    require('./skill')(router, 'skill');
    require('./species')(router, 'species');
    require('./../default')(router, 'wound');

};