module.exports = function(pool, router) {
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
    require('./default')(pool, router, 'species');
    require('./default')(pool, router, 'software');
    require('./default')(pool, router, 'weaponquality');
    require('./default')(pool, router, 'wound');

    // CUSTOM
    require('./standard/asset')(pool, router, 'asset');
    require('./standard/assettype')(pool, router, 'assettype');
    require('./standard/attribute')(pool, router, 'attribute');
    require('./standard/augmentation')(pool, router, 'augmentation');
    require('./standard/caste')(pool, router, 'caste');
    require('./standard/characteristic')(pool, router, 'characteristic');
    require('./standard/expertise')(pool, router, 'expertise');
    require('./standard/focus')(pool, router, 'focus');
    require('./standard/identity')(pool, router, 'identity');
    require('./standard/milestone')(pool, router, 'milestone');
    require('./standard/nature')(pool, router, 'nature');
    require('./standard/protection')(pool, router, 'protection');
    require('./standard/protectiontype')(pool, router, 'protectiontype');
    require('./standard/story')(pool, router, 'story');
    require('./standard/weapon')(pool, router, 'weapon');
    require('./standard/weapongroup')(pool, router, 'weapongroup');
    require('./standard/weaponmod')(pool, router, 'weaponmod');
    require('./standard/weapontype')(pool, router, 'weapontype');

    // PERSON
    require('./person/person')(pool, router, 'person');

    // SETTING
    require('./default')(pool, router, 'setting');
};