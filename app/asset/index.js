module.exports = function(pool, router) {

    require('./asset')(pool, router, 'asset');
    require('./assettype')(pool, router, 'assettype');
    require('./../default')(pool, router, 'assetgroup');
    require('./augmentation')(pool, router, 'augmentation');
    require('./../default')(pool, router, 'augmentationquality');
    require('./bionic')(pool, router, 'bionic');
    require('./../default')(pool, router, 'bionicquality');
    require('./protection')(pool, router, 'protection');
    require('./protectiontype')(pool, router, 'protectiontype');
    require('./../default')(pool, router, 'protectionquality');
    require('./../default')(pool, router, 'software');
    require('./weapon')(pool, router, 'weapon');
    require('./weapontype')(pool, router, 'weapontype');
    require('./weapongroup')(pool, router, 'weapongroup');
    require('./../default')(pool, router, 'weaponquality');
    require('./weaponmod')(pool, router, 'weaponmod');

};