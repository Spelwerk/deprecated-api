module.exports = function(pool, router) {

    require('./attribute')(pool, router, 'attribute');
    require('./../default')(pool, router, 'attributetype');
    require('./../default')(pool, router, 'bodypart');
    require('./background')(pool, router, 'background');
    require('./background_has_asset')(pool, router, 'background_has_asset', '/background-asset');
    require('./background_has_attribute')(pool, router, 'background_has_attribute', '/background-attribute');
    require('./characteristic')(pool, router, 'characteristic');
    require('./expertise')(pool, router, 'expertise');
    require('./../default')(pool, router, 'expertisetype');
    require('./focus')(pool, router, 'focus');
    require('./identity')(pool, router, 'identity');
    require('./loyalty')(pool, router, 'loyalty');
    require('./manifestation')(pool, router, 'manifestation');
    require('./milestone')(pool, router, 'milestone');
    require('./nature')(pool, router, 'nature');
    require('./species')(pool, router, 'species');
    require('./species_has_attribute')(pool, router, 'species_has_attribute', '/species-attribute');
    require('./species_has_weapon')(pool, router, 'species_has_weapon', '/species-weapon');
    require('./../default')(pool, router, 'wound');

};