module.exports = function(router) {

    require('./icon')(router, 'icon', '/icon');
    require('./system')(router);

};