// DEFAULT
require('./default/assetgroup');
require('./default/attributetype');
require('./default/augmentationquality');
require('./default/bionicquality');
require('./default/bodypart');
require('./default/expertisetype');
require('./default/loyalty');
require('./default/manifestation');
require('./default/protectionquality');
require('./default/species');
require('./standard/software');
require('./default/weaponquality');
require('./default/wound');

// SETTING
require('./setting/setting');

// STANDARD
require('./standard/bionic');
require('./standard/story');
require('./standard/assettype');
require('./standard/asset');
require('./standard/attribute');
require('./standard/species_has_attribute');
require('./standard/caste');
require('./standard/focus');
require('./standard/identity');
require('./standard/nature');
require('./standard/protectiontype');
require('./standard/protection');
require('./standard/expertise');
require('./standard/milestone');
require('./standard/characteristic');
require('./standard/weapongroup');
require('./standard/weapontype');
require('./standard/weapon');
require('./standard/weaponmod');
require('./standard/augmentation');

// SETTING
require('./setting/setting_has_asset');
require('./setting/setting_has_attribute');
require('./setting/setting_has_augmentation');
require('./setting/setting_has_bionic');
require('./setting/setting_has_caste');
require('./setting/setting_has_characteristic');
require('./setting/setting_has_expertise');
require('./setting/setting_has_focus');
require('./setting/setting_has_identity');
require('./setting/setting_has_manifestation');
require('./setting/setting_has_milestone');
require('./setting/setting_has_nature');
require('./setting/setting_has_protection');
require('./setting/setting_has_software');
require('./setting/setting_has_species');
require('./setting/setting_has_weapon');
require('./setting/setting_has_weaponmod');

// PERSON
require('./person/person');
require('./person/person_has_asset');
require('./person/person_has_attribute');
require('./person/person_has_augmentation');
require('./person/person_has_bionic');
require('./person/person_has_characteristic');
require('./person/person_has_expertise');
require('./person/person_has_milestone');
require('./person/person_has_protection');
require('./person/person_has_software');
require('./person/person_has_weapon');
require('./person/person_has_weaponmod');
require('./person/person_has_wound');
require('./person/person_has_person');

// STORY
require('./standard/story');
require('./standard/story_has_person');

// USER
require('./user/user');
require('./user/user_has_person');
require('./user/user_has_story');

// SITE
require('./site/comment');
require('./site/promotional');
require('./site/articletype');
require('./site/article');
require('./site/article_has_comment');