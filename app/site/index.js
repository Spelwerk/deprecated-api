module.exports = function(pool, router) {

    require('./../default')(pool, router, 'icon');
    require('./../default')(pool, router, 'comment');
    require('./article')(pool, router, 'article');
    require('./article_has_comment')(pool, router, 'article_has_comment', '/article-comment');
    require('./../default')(pool, router, 'articletype');
    require('./promotional')(pool, router, 'promotional');

};