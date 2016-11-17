module.exports = function(pool, router) {
    // DEFAULT
    require('./default')(pool, router, 'assetgroup');
    require('./default')(pool, router, 'attributetype');
    require('./default')(pool, router, 'augmentationquality');
    require('./default')(pool, router, 'bionicquality');
    require('./default')(pool, router, 'bodypart');
    require('./default')(pool, router, 'expertisetype');
    require('./default')(pool, router, 'loyalty');
    require('./default')(pool, router, 'manifestation');
    require('./default')(pool, router, 'permissions');
    require('./default')(pool, router, 'protectionquality');
    require('./default')(pool, router, 'species');
    require('./default')(pool, router, 'software');
    require('./default')(pool, router, 'weaponquality');
    require('./default')(pool, router, 'wound');

    // STANDARD
    require('./standard/asset')(pool, router, 'asset');
    require('./standard/assettype')(pool, router, 'assettype');
    require('./standard/attribute')(pool, router, 'attribute');
    require('./standard/augmentation')(pool, router, 'augmentation');
    require('./standard/bionic')(pool, router, 'bionic');
    require('./standard/caste')(pool, router, 'caste');
    require('./standard/characteristic')(pool, router, 'characteristic');
    require('./standard/expertise')(pool, router, 'expertise');
    require('./standard/focus')(pool, router, 'focus');
    require('./standard/identity')(pool, router, 'identity');
    require('./standard/milestone')(pool, router, 'milestone');
    require('./standard/nature')(pool, router, 'nature');
    require('./standard/protection')(pool, router, 'protection');
    require('./standard/protectiontype')(pool, router, 'protectiontype');
    require('./standard/species_has_attribute')(pool, router, 'species_has_attribute', '/species-attribute');
    require('./standard/story')(pool, router, 'story');
    require('./standard/story_has_person')(pool, router, 'story_has_person', '/story-person');
    require('./standard/weapon')(pool, router, 'weapon');
    require('./standard/weapongroup')(pool, router, 'weapongroup');
    require('./standard/weaponmod')(pool, router, 'weaponmod');
    require('./standard/weapontype')(pool, router, 'weapontype');

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

    // SETTING
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

    // USER
    require('./user/user')(pool, router, 'user');
    require('./user/user_has_person')(pool, router, 'user_has_person', '/user-person');
    require('./user/user_has_story')(pool, router, 'user_has_story', '/user-story');

    // SITE
    require('./default')(pool, router, 'comment');
    require('./site/article')(pool, router, 'article');
    require('./site/article_has_comment')(pool, router, 'article_has_comment', '/article-comment');
    require('./site/articletype')(pool, router, 'articletype');
    require('./site/promotional')(pool, router, 'promotional');
};