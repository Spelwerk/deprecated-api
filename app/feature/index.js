module.exports = function(pool, router) {

    require('./attribute')(pool, router, 'attribute');
    require('./../default')(pool, router, 'attributetype');
    require('./../default')(pool, router, 'bodypart');
    require('./background')(pool, router, 'background');
    require('./../default')(pool, router, 'disease');
    require('./doctrine')(pool, router, 'doctrine');
    require('./expertise')(pool, router, 'expertise');
    require('./focus')(pool, router, 'focus');
    require('./gift')(pool, router, 'gift');
    require('./../default')(pool, router, 'identity');
    require('./imperfection')(pool, router, 'imperfection');
    require('./../default')(pool, router, 'loyalty');
    require('./manifestation')(pool, router, 'manifestation');
    require('./milestone')(pool, router, 'milestone');
    require('./../default')(pool, router, 'nature');
    require('./../default')(pool, router, 'sanity');
    require('./skill')(pool, router, 'skill');
    require('./species')(pool, router, 'species');
    require('./../default')(pool, router, 'wound');

};