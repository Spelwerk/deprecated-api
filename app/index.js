module.exports = function(pool, router) {
    // CUSTOM
    require('./route/nature')(pool, router, 'nature');
    require('./route/identity')(pool, router, 'identity');
    require('./route/focus')(pool, router, 'focus');
    require('./route/protection')(pool, router, 'protection');

    // DEFAULT
    require('./default')(pool, router, 'assetgroup');
    require('./default')(pool, router, 'attributetype');
    require('./default')(pool, router, 'augmentationquality');
    require('./default')(pool, router, 'bionic');
    require('./default')(pool, router, 'bionicquality');
    require('./default')(pool, router, 'caste');
    require('./default')(pool, router, 'expertisetype');
    require('./default')(pool, router, 'loyalty');
    require('./default')(pool, router, 'manifestation');
    require('./default')(pool, router, 'protectionquality');
    require('./default')(pool, router, 'protectiontype');
    require('./default')(pool, router, 'setting');
    require('./default')(pool, router, 'species');
    require('./default')(pool, router, 'software');
    require('./default')(pool, router, 'weaponquality');
    require('./default')(pool, router, 'wound');
};