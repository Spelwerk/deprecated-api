var express = require('express'),
    bodyParser = require('body-parser'),
    webtokens = require('./app/tokens'),
    mysql = require('mysql'),
    config = require('./app/config');

var app = express(),
    router = express.Router(),
    pool = mysql.createPool(config.pool);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

router.use(function(req, res, next) {
    if(req.headers.apikey != config.keys.api) {
        res.status(403).send({error: 'faulty apikey'});
    } else {
        next();
    }
});

require('./app/index')(pool, router);

app.use('/api/', router);

app.listen(config.port);