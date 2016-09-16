var express = require('express'),
    bodyParser = require('body-parser'),
    auth = require('basic-auth'),
    mysql = require('mysql'),
    config = require('./app/config');

var app = express(),
    router = express.Router(),
    pool = mysql.createPool(config.pool);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

router.use(function (req, res, next) {
    var credentials = auth(req);

    if (!credentials) {
        res.setHeader('WWW-Authenticate', 'Basic realm="spelwerk"');
        res.status(403).send({message: 'Access denied! Basic Auth missing.'});
    }

    if (credentials.name !== config.keys.user|| credentials.pass !== config.keys.pass) {
        res.setHeader('WWW-Authenticate', 'Basic realm="spelwerk"');
        res.status(403).send({message: 'Access denied! Incorrect credentials.'});
    }

    next();
});

require('./app/index')(pool, router);

app.use('/api/', router);

app.listen(config.port);