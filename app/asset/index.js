module.exports = function(router) {

    require('./asset')(router, 'asset');
    require('./assettype')(router, 'assettype');
    require('./../default')(router, 'assetgroup');
    require('./augmentation')(router, 'augmentation');
    require('./../default')(router, 'augmentationquality');
    require('./bionic')(router, 'bionic');
    require('./../default')(router, 'bionicquality');
    require('./protection')(router, 'protection');
    require('./../default')(router, 'protectionquality');
    require('./weapon')(router, 'weapon');
    require('./weapontype')(router, 'weapontype');
    require('./weapongroup')(router, 'weapongroup');
    require('./../default')(router, 'weaponquality');
    require('./weaponmod')(router, 'weaponmod');

};