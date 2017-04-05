module.exports = function(pool, router) {

    require('./person')(pool, router, 'person');
    require('./person_has_asset')(pool, router, 'person_has_asset', '/person-asset');
    require('./person_has_attribute')(pool, router, 'person_has_attribute', '/person-attribute');
    require('./person_has_augmentation')(pool, router, 'person_has_augmentation', '/person-augmentation');
    require('./person_has_bionic')(pool, router, 'person_has_bionic', '/person-bionic');
    require('./person_has_characteristic')(pool, router, 'person_has_characteristic', '/person-characteristic');
    require('./person_has_disease')(pool, router, 'person_has_disease', '/person-disease');
    // require('./person_has_companion')(pool, router, 'person_has_companion', '/person-companion');
    require('./person_has_expertise')(pool, router, 'person_has_expertise', '/person-expertise');
    require('./person_has_milestone')(pool, router, 'person_has_milestone', '/person-milestone');
    require('./person_has_person')(pool, router, 'person_has_person', '/person-person');
    require('./person_has_protection')(pool, router, 'person_has_protection', '/person-protection');
    require('./person_has_sanity')(pool, router, 'person_has_sanity', '/person-sanity');
    require('./person_has_software')(pool, router, 'person_has_software', '/person-software');
    require('./person_has_weapon')(pool, router, 'person_has_weapon', '/person-weapon');
    require('./person_has_weaponmod')(pool, router, 'person_has_weaponmod', '/person-weaponmod');
    require('./person_has_wound')(pool, router, 'person_has_wound', '/person-wound');

};