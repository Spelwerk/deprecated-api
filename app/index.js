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
    require('./setting/setting')(pool, router, 'setting');
    require('./setting/setting_has_asset')(pool, router, 'setting_has_asset', '/setting-asset');
    require('./setting/setting_has_attribute')(pool, router, 'setting_has_attribute', '/setting-attribute');
    require('./setting/setting_has_augmentation')(pool, router, 'setting_has_augmentation', '/setting-augmentation');
    require('./setting/setting_has_bionic')(pool, router, 'setting_has_bionic', '/setting-bionic');
    require('./setting/setting_has_caste')(pool, router, 'setting_has_caste', '/setting-caste');
    require('./setting/setting_has_characteristic')(pool, router, 'setting_has_characteristic', '/setting-characteristic');
    require('./setting/setting_has_expertise')(pool, router, 'setting_has_expertise', '/setting-expertise');
    require('./setting/setting_has_focus')(pool, router, 'setting_has_focus', '/setting-focus');
    require('./setting/setting_has_identity')(pool, router, 'setting_has_identity', '/setting-identity');
    require('./setting/setting_has_manifestation')(pool, router, 'setting_has_manifestation', '/setting-manifestation');
    require('./setting/setting_has_milestone')(pool, router, 'setting_has_milestone', '/setting-milestone');
    require('./setting/setting_has_nature')(pool, router, 'setting_has_nature', '/setting-nature');
    require('./setting/setting_has_protection')(pool, router, 'setting_has_protection', '/setting-protection');
    require('./setting/setting_has_software')(pool, router, 'setting_has_software', '/setting-software');
    require('./setting/setting_has_species')(pool, router, 'setting_has_species', '/setting-species');
    require('./setting/setting_has_weapon')(pool, router, 'setting_has_weapon', '/setting-weapon');
    require('./setting/setting_has_weaponmod')(pool, router, 'setting_has_weaponmod', '/setting-weaponmod');

    // USER
    require('./user/user')(pool, router, 'user');
    require('./user/user_has_person')(pool, router, 'user_has_person', '/user-person');
    require('./user/user_has_story')(pool, router, 'user_has_story', '/user-story');

    // PAGE
    require('./default')(pool, router, 'comment');
    require('./site/article')(pool, router, 'article');
    require('./site/article_has_comment')(pool, router, 'article_has_comment', '/article-comment');
    require('./site/articletype')(pool, router, 'articletype');
    require('./site/promotional')(pool, router, 'promotional');
};