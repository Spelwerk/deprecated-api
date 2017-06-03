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
    req.table = {};

    req.table.admin = false;

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
            rest.query('SELECT user_id FROM usertoken WHERE token = ?', [req.user.token], function(err, result) {
                if(!result[0]) return callback('Token missing from database.');

                req.user.id = result[0].user_id;

                callback(err);
            });
        },
        function(callback) {
            rest.query('SELECT id,admin,verify FROM user WHERE id = ?',[req.user.id], function(err, result) {
                if(!result[0]) return callback({status: 400, code: 0, message: 'User missing from database.'});

                req.user.select = result[0];

                req.user.admin = req.user.select.admin;
                req.user.verify = req.user.select.verify;

                callback(err);
            });
        },
        function(callback) {
            callback();
            /*
            rest.query('SELECT permission.name FROM user_has_permission LEFT JOIN permission ON permission.id = user_has_permission.permission_id WHERE user_id = ?', [req.user.id], function(err, result) {
                req.user.permissions = result;

                callback(err);
            });
            */
        }
    ],function(err) {
        next(err);
    });
});

require('./app/index')(router);

app.use('/', router);

app.use(function(err, req, res) {
    console.log(err);

    res.status(500).send(err);
});

var listeningMessage = 'server.js listening on port: ' + config.port;

console.log(listeningMessage);
logger.debug(listeningMessage);

app.listen(config.port);