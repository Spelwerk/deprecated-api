module.exports = function(pool, router) {

    require('./world')(pool, router, 'world');

    require('./country')(pool, router, 'country');
    require('./../default')(pool, router, 'language');
    require('./../default')(pool, router, 'firstname');
    require('./../default')(pool, router, 'firstnamegroup');
    require('./firstnamegroup_has_firstname')(pool, router, 'firstnamegroup_has_firstname', '/firstnamegroup-firstname');
    require('./../default')(pool, router, 'surname');
    require('./../default')(pool, router, 'surnamegroup');
    require('./surnamegroup_has_surname')(pool, router, 'surnamegroup_has_surname', '/surnamegroup-surname');

};