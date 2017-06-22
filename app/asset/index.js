module.exports = function(router) {

    require('./asset')(router, 'asset', '/asset');
    require('./assettype')(router, 'assettype', '/assettype');
    require('./assetgroup')(router, 'assetgroup', '/assetgroup');
    require('./augmentation')(router, 'augmentation', '/augmentation');
    require('./bionic')(router, 'bionic', '/bionic');
    require('./bodypart')(router, 'bodypart', '/bodypart');
    require('./protection')(router, 'protection', '/protection');
    require('./protectionquality')(router, 'protectionquality', '/protectionquality');
    require('./software')(router, 'software', '/software');
    require('./weapon')(router, 'weapon', '/weapon');
    require('./weapontype')(router, 'weapontype', '/weapontype');
    require('./weapongroup')(router, 'weapongroup', '/weapongroup');
    require('./weaponmod')(router, 'weaponmod', '/weaponmod');

};