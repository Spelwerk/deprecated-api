var defaults = require('./../config').defaults;

module.exports = function(router) {

    router.get('/system', function(req, res) {
        res.status(200).send(defaults)
    });

    router.get('/system/attribute', function(req, res) {
        res.status(200).send(defaults.attribute)
    });

    router.get('/system/doctrine', function(req, res) {
        res.status(200).send(defaults.doctrine)
    });

    router.get('/system/expertise', function(req, res) {
        res.status(200).send(defaults.expertise)
    });

    router.get('/system/skill', function(req, res) {
        res.status(200).send(defaults.skill)
    });

    router.get('/system/icon', function(req, res) {
        res.status(200).send(defaults.icon)
    });

};