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
    if(!req.headers.token) return next();

    req.user = {};

    req.user.token = req.headers.token;
    req.user.decoded = tokens.decode(req);
    req.user.email = req.user.decoded.email;

    if(!req.user.decoded) return next('Invalid token.');

    async.series([
        function(callback) {
            rest.query('SELECT user_id AS id FROM usertoken WHERE token = ?', [req.user.token], function(err, result) {
                if(!result[0]) return callback('Token missing from database.');

                req.user.id = result[0].id;

                callback(err);
            });
        },
        function(callback) {
            rest.query('SELECT id,admin,verify FROM user WHERE id = ?', [req.user.id], function(err, result) {
                if(!result[0]) return callback('User missing from database.');

                req.user.select = result[0];
                req.user.admin = result[0].admin;

                callback(err);
            });
        }
    ],function(err) {
        next(err);
    })
});

require('./app/index')(router);

app.use('/', router);

app.use(function(err, req, res, next) {
    if(err.originalUrl) {
        console.error('ERROR WHEN TRYING TO PARSE >> ' + err.originalUrl);
    } else {
        console.error(err);
    }

    next(err);
});

app.use(function(err, req, res) {
    res.status(500).send(err);
});

var listeningMessage = 'server.js listening on port: ' + config.port;

console.log(listeningMessage);
logger.debug(listeningMessage);

app.listen(config.port);