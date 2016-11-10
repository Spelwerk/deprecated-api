var express = require('express'),
    bodyParser = require('body-parser'),
    mysql = require('mysql'),
    logger = require('./app/logger'),
    config = require('./app/config');

var app = express(),
    router = express.Router(),
    pool = mysql.createPool(config.pool);

app.use(require('morgan')('combined', {'stream':logger.stream}));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

router.use(function(req, res, next) {
    if(req.headers.apikey != config.secrets.api) {
        var ip = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        logger.error('caught faulty api key in header from IP: ' + ip + '. Key used: ' + req.headers.apikey);

        res.status(403).send({error: 'faulty api key'});
    } else {
        next();
    }
});

require('./app/index')(pool, router);

app.use('/api/', router);

logger.debug('server.js listening on port: %s', config.port);

app.listen(config.port);