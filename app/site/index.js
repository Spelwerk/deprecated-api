module.exports = function(pool, router) {

    require('./../default')(pool, router, 'icon');
    require('./system')(pool, router);

};