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

        logger.logError('server.js', 'Faulty apikey in header from IP: ' + ip + '. Key used: ' + req.headers.apikey, 'APIVERIFICATION');

        res.status(403).send({header: 'Faulty API Key', message: 'Faulty API Key used.'});
    } else {
        next();
    }
});

router.use(function(req, res, next) {
    if(req.headers.debug !== undefined) {
        config.debugMode = req.headers.debug;
    }

    next();
});

require('./app/index')(pool, router);

app.use('/', router);

var listeningMessage = 'server.js listening on port: ' + config.port;

console.log(listeningMessage);
logger.debug(listeningMessage);

app.listen(config.port);