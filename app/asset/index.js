module.exports = function(router) {

    require('./asset')(router, 'asset');
    require('./assettype')(router, 'assettype');
    require('./assetgroup')(router, 'assetgroup');
    require('./augmentation')(router, 'augmentation');
    require('./augmentationquality')(router, 'augmentationquality');
    require('./bionic')(router, 'bionic');
    require('./bionicquality')(router, 'bionicquality');
    require('./protection')(router, 'protection');
    require('./protectionquality')(router, 'protectionquality');
    require('./software')(router, 'software');
    require('./weapon')(router, 'weapon');
    require('./weapontype')(router, 'weapontype');
    require('./weapongroup')(router, 'weapongroup');
    require('./weaponquality')(router, 'weaponquality');
    require('./weaponmod')(router, 'weaponmod');

};