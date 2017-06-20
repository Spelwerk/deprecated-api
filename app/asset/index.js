module.exports = function(router) {

    require('./asset')(router, 'asset');
    require('./assettype')(router, 'assettype');
    require('./assetgroup')(router, 'assetgroup');
    require('./augmentation')(router, 'augmentation');
    require('./bionic')(router, 'bionic');
    require('./bodypart')(router, 'bodypart');
    require('./protection')(router, 'protection');
    require('./protectionquality')(router, 'protectionquality');
    require('./software')(router, 'software');
    require('./weapon')(router, 'weapon');
    require('./weapontype')(router, 'weapontype');
    require('./weapongroup')(router, 'weapongroup');
    require('./weaponmod')(router, 'weaponmod');

};