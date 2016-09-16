module.exports = function(pool, router) {
    // CUSTOM
    require('./route/nature')(pool, router, '/nature', 'nature');
    require('./route/nature')(pool, router, '/identity', 'identity');

    // DEFAULT
    require('./default')(pool, router, '/assetgroup', 'assetgroup');
    require('./default')(pool, router, '/attributetype', 'attributetype');
    require('./default')(pool, router, '/augmentationquality', 'augmentationquality');
    require('./default')(pool, router, '/bionic', 'bionic');
    require('./default')(pool, router, '/bionicquality', 'bionicquality');
    require('./default')(pool, router, '/caste', 'caste');
    require('./default')(pool, router, '/expertisetype', 'expertisetype');
    require('./default')(pool, router, '/loyalty', 'loyalty');
    require('./default')(pool, router, '/manifestation', 'manifestation');
    require('./default')(pool, router, '/protectionquality', 'protectionquality');
    require('./default')(pool, router, '/protectiontype', 'protectiontype');
    require('./default')(pool, router, '/setting', 'setting');
    require('./default')(pool, router, '/species', 'species');
    require('./default')(pool, router, '/software', 'software');
    require('./default')(pool, router, '/weaponmod', 'weaponmod');
    require('./default')(pool, router, '/weaponquality', 'weaponquality');
    require('./default')(pool, router, '/wound', 'wound');
};