module.exports = function(pool, router) {

    // PERSON
    require('./person/person')(pool, router, 'person');
    require('./person/person_has_asset')(pool, router, 'person_has_asset', '/person-asset');
    require('./person/person_has_attribute')(pool, router, 'person_has_attribute', '/person-attribute');
    require('./person/person_has_augmentation')(pool, router, 'person_has_augmentation', '/person-augmentation');
    require('./person/person_has_bionic')(pool, router, 'person_has_bionic', '/person-bionic');
    require('./person/person_has_characteristic')(pool, router, 'person_has_characteristic', '/person-characteristic');
    require('./person/person_has_expertise')(pool, router, 'person_has_expertise', '/person-expertise');
    require('./person/person_has_milestone')(pool, router, 'person_has_milestone', '/person-milestone');
    require('./person/person_has_person')(pool, router, 'person_has_person', '/person-person');
    require('./person/person_has_protection')(pool, router, 'person_has_protection', '/person-protection');
    require('./person/person_has_software')(pool, router, 'person_has_software', '/person-software');
    require('./person/person_has_weapon')(pool, router, 'person_has_weapon', '/person-weapon');
    require('./person/person_has_weaponmod')(pool, router, 'person_has_weaponmod', '/person-weaponmod');
    require('./person/person_has_wound')(pool, router, 'person_has_wound', '/person-wound');

    // PERSON FEATURE
    require('./feature/attribute')(pool, router, 'attribute');
    require('./default')(pool, router, 'attributetype');
    require('./default')(pool, router, 'bodypart');
    require('./feature/caste')(pool, router, 'caste');
    require('./feature/characteristic')(pool, router, 'characteristic');
    require('./feature/expertise')(pool, router, 'expertise');
    require('./default')(pool, router, 'expertisetype');
    require('./feature/focus')(pool, router, 'focus');
    require('./feature/identity')(pool, router, 'identity');
    require('./feature/loyalty')(pool, router, 'loyalty');
    require('./feature/manifestation')(pool, router, 'manifestation');
    require('./feature/milestone')(pool, router, 'milestone');
    require('./feature/nature')(pool, router, 'nature');
    require('./feature/species')(pool, router, 'species');
    require('./feature/species_has_attribute')(pool, router, 'species_has_attribute', '/species-attribute');
    require('./default')(pool, router, 'wound');

    // PERSON ASSET
    require('./asset/asset')(pool, router, 'asset');
    require('./asset/assettype')(pool, router, 'assettype');
    require('./default')(pool, router, 'assetgroup');
    require('./asset/augmentation')(pool, router, 'augmentation');
    require('./default')(pool, router, 'augmentationquality');
    require('./asset/bionic')(pool, router, 'bionic');
    require('./default')(pool, router, 'bionicquality');
    require('./asset/protection')(pool, router, 'protection');
    require('./asset/protectiontype')(pool, router, 'protectiontype');
    require('./default')(pool, router, 'protectionquality');
    require('./default')(pool, router, 'software');
    require('./asset/weapon')(pool, router, 'weapon');
    require('./asset/weapontype')(pool, router, 'weapontype');
    require('./asset/weapongroup')(pool, router, 'weapongroup');
    require('./default')(pool, router, 'weaponquality');
    require('./asset/weaponmod')(pool, router, 'weaponmod');

    // STORY
    require('./story/story')(pool, router, 'story');
    require('./story/story_has_person')(pool, router, 'story_has_person', '/story-person');

    // WORLD
    require('./world/world')(pool, router, 'world');
    require('./world/world_has_asset')(pool, router, 'world_has_asset', '/world-asset');
    require('./world/world_has_attribute')(pool, router, 'world_has_attribute', '/world-attribute');
    require('./world/world_has_augmentation')(pool, router, 'world_has_augmentation', '/world-augmentation');
    require('./world/world_has_bionic')(pool, router, 'world_has_bionic', '/world-bionic');
    require('./world/world_has_caste')(pool, router, 'world_has_caste', '/world-caste');
    require('./world/world_has_characteristic')(pool, router, 'world_has_characteristic', '/world-characteristic');
    require('./world/world_has_expertise')(pool, router, 'world_has_expertise', '/world-expertise');
    require('./world/world_has_focus')(pool, router, 'world_has_focus', '/world-focus');
    require('./world/world_has_identity')(pool, router, 'world_has_identity', '/world-identity');
    require('./world/world_has_manifestation')(pool, router, 'world_has_manifestation', '/world-manifestation');
    require('./world/world_has_milestone')(pool, router, 'world_has_milestone', '/world-milestone');
    require('./world/world_has_nature')(pool, router, 'world_has_nature', '/world-nature');
    require('./world/world_has_protection')(pool, router, 'world_has_protection', '/world-protection');
    require('./world/world_has_software')(pool, router, 'world_has_software', '/world-software');
    require('./world/world_has_species')(pool, router, 'world_has_species', '/world-species');
    require('./world/world_has_weapon')(pool, router, 'world_has_weapon', '/world-weapon');
    require('./world/world_has_weaponmod')(pool, router, 'world_has_weaponmod', '/world-weaponmod');
    require('./world/country')(pool, router, 'country');
    require('./default')(pool, router, 'language');
    require('./default')(pool, router, 'firstname');
    require('./default')(pool, router, 'firstnamegroup');
    require('./world/firstnamegroup_has_firstname')(pool, router, 'firstnamegroup_has_firstname', '/firstnamegroup-firstname');
    require('./default')(pool, router, 'surname');
    require('./default')(pool, router, 'surnamegroup');
    require('./world/surnamegroup_has_surname')(pool, router, 'surnamegroup_has_surname', '/surnamegroup-surname');

    // USER
    require('./user/user')(pool, router, 'user');
    require('./user/user_has_person')(pool, router, 'user_has_person', '/user-person');
    require('./user/user_has_story')(pool, router, 'user_has_story', '/user-story');
    require('./user/user_has_world')(pool, router, 'user_has_world.js', '/user-world');
    require('./default')(pool, router, 'permission');

    // SITE
    require('./default')(pool, router, 'icon');
    require('./default')(pool, router, 'comment');
    require('./site/article')(pool, router, 'article');
    require('./site/article_has_comment')(pool, router, 'article_has_comment', '/article-comment');
    require('./default')(pool, router, 'articletype');
    require('./site/promotional')(pool, router, 'promotional');
};