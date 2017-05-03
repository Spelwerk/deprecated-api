var defaults = require('./../config').defaults;

module.exports = function(pool, router) {

    router.get('/system', function(req, res) {
        res.status(200).send(defaults)
    });

};