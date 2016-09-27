var winston = require('winston');

var logger = new winston.Logger({
    transports: [
/*
        new winston.transports.Console({
            name: 'console',
            level: 'debug',
            json: false,
            colorize: true,
            handleExceptions: true
        }),
*/
        new winston.transports.File({
            name: 'exception',
            filename: './logs/exception.log',
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            handleExceptions: true
        }),
        new winston.transports.File({
            name: 'error',
            level: 'error',
            filename: './logs/error.log',
            json: true,
            maxsize: 5242880,
            maxFiles: 5
        }),
        new winston.transports.File({
            name: 'debug',
            level: 'debug',
            filename: './logs/debug.log',
            json: true,
            maxsize: 5242880,
            maxFiles: 5
        })
    ],
    exitOnError: false
});

module.exports = logger;

module.exports.stream = {
    write: function(message, encoding){
        logger.debug(message);
    }
};