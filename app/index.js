module.exports = function(pool, router) {
    // CUSTOM
    require('./route/asset')(pool, router, 'asset');
    require('./route/assettype')(pool, router, 'assettype');
    require('./route/attribute')(pool, router, 'attribute');
    require('./route/caste')(pool, router, 'caste');
    require('./route/characteristic')(pool, router, 'characteristic');
    require('./route/expertise')(pool, router, 'expertise');
    require('./route/focus')(pool, router, 'focus');
    require('./route/identity')(pool, router, 'identity');
    require('./route/milestone')(pool, router, 'milestone');
    require('./route/nature')(pool, router, 'nature');
    require('./route/protection')(pool, router, 'protection');
    require('./route/protectiontype')(pool, router, 'protectiontype');
    require('./route/relationship')(pool, router, 'relationship');
    require('./route/weapongroup')(pool, router, 'weapongroup');
    require('./route/weaponmod')(pool, router, 'weaponmod');

    // DEFAULT
    require('./default')(pool, router, 'assetgroup');
    require('./default')(pool, router, 'attributetype');
    require('./default')(pool, router, 'augmentationquality');
    require('./default')(pool, router, 'bionic');
    require('./default')(pool, router, 'bionicquality');
    require('./default')(pool, router, 'expertisetype');
    require('./default')(pool, router, 'loyalty');
    require('./default')(pool, router, 'manifestation');
    require('./default')(pool, router, 'protectionquality');
    require('./default')(pool, router, 'setting');
    require('./default')(pool, router, 'species');
    require('./default')(pool, router, 'software');
    require('./default')(pool, router, 'weaponquality');
    require('./default')(pool, router, 'wound');
};