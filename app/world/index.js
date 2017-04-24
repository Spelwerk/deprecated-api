module.exports = function(pool, router) {

    require('./world')(pool, router, 'world');
    require('./world_has_asset')(pool, router, 'world_has_asset', '/world-asset');
    require('./world_has_attribute')(pool, router, 'world_has_attribute', '/world-attribute');
    require('./world_has_bionic')(pool, router, 'world_has_bionic', '/world-bionic');
    require('./world_has_background')(pool, router, 'world_has_background', '/world-background');
    require('./world_has_characteristic')(pool, router, 'world_has_characteristic', '/world-characteristic');
    require('./world_has_expertise')(pool, router, 'world_has_expertise', '/world-expertise');
    require('./world_has_focus')(pool, router, 'world_has_focus', '/world-focus');
    require('./world_has_identity')(pool, router, 'world_has_identity', '/world-identity');
    require('./world_has_manifestation')(pool, router, 'world_has_manifestation', '/world-manifestation');
    require('./world_has_milestone')(pool, router, 'world_has_milestone', '/world-milestone');
    require('./world_has_nature')(pool, router, 'world_has_nature', '/world-nature');
    require('./world_has_protection')(pool, router, 'world_has_protection', '/world-protection');
    require('./world_has_software')(pool, router, 'world_has_software', '/world-software');
    require('./world_has_species')(pool, router, 'world_has_species', '/world-species');
    require('./world_has_weapon')(pool, router, 'world_has_weapon', '/world-weapon');
    require('./world_has_weaponmod')(pool, router, 'world_has_weaponmod', '/world-weaponmod');
    require('./country')(pool, router, 'country');
    require('./../default')(pool, router, 'language');
    require('./../default')(pool, router, 'firstname');
    require('./../default')(pool, router, 'firstnamegroup');
    require('./firstnamegroup_has_firstname')(pool, router, 'firstnamegroup_has_firstname', '/firstnamegroup-firstname');
    require('./../default')(pool, router, 'surname');
    require('./../default')(pool, router, 'surnamegroup');
    require('./surnamegroup_has_surname')(pool, router, 'surnamegroup_has_surname', '/surnamegroup-surname');

};