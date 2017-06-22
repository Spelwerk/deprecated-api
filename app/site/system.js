var defaults = require('./../config').defaults;

module.exports = function(router) {

    router.get('/system/defaults', function(req, res) {
        res.status(200).send(defaults)
    });

};