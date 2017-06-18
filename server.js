var express = require('express'),
    bodyParser = require('body-parser'),
    async = require('async'),
    logger = require('./app/logger'),
    config = require('./app/config'),
    tokens = require('./app/tokens'),
    rest = require('./app/rest');

var app = express(),
    router = express.Router();

app.use(require('morgan')('combined', {'stream':logger.stream}));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    if(req.headers.apikey !== config.secret.api) return next('Faulty API Key');

    next();
});

app.use(function(req, res, next) {
    if(req.headers.debug !== undefined) {
        req.debug = req.headers.debug;
    }

    next();
});

app.use(function(req, res, next) {
    if(!req.headers.token) return next();

    req.user = {};

    req.user.token = req.headers.token;
    req.user.decoded = tokens.decode(req);
    req.user.email = req.user.decoded.email;

    if(!req.user.decoded) return next('Invalid token.');

    var query = 'SELECT ' +
        'usertoken.user_id AS id, ' +
        'user.admin, ' +
        'user.verify ' +
        'FROM usertoken ' +
        'LEFT JOIN user ON user.id = usertoken.user_id ' +
        'WHERE usertoken.token = ?';

    rest.query(query, [req.user.token], function(err, result) {
        if(!result) return next('Token or user missing from database.');

        req.user.select = result[0];

        req.user.id = req.user.select.id;
        req.user.admin = req.user.select.admin;
        req.user.verify = req.user.select.verify;

        next(err);
    });
});

require('./app/index')(router);

app.use('/', router);

app.use(function(err, req, res) {
    if(err.originalUrl) {
        console.log('ERROR WHEN TRYING TO PARSE >> ' + err.originalUrl);
    } else {
        console.log(err);
    }

    res.status(500).send(err);
});

var listeningMessage = 'server.js listening on port: ' + config.port;

console.log(listeningMessage);
logger.debug(listeningMessage);

app.listen(config.port);