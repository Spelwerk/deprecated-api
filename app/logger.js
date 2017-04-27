var winston = require('winston'),
    debugMode = require('./config').debugMode;

var logger = new winston.Logger({
    transports: [
        new winston.transports.File({
            name: 'error',
            level: 'error',
            filename: './logs/error.log',
            json: true,
            maxsize: 5242880,
            maxFiles: 5,
            handleExceptions: true
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

module.exports.logCall = function(file, call, error) {
    file = file || 'unknown';
    error = error || null;

    if(debugMode) {
        console.log('\ncall:'); console.log(call);

        if(error) {
            console.log('error:'); console.log(error);

            logger.debug({error: error, file: file, method: 'SQL', call: call});
        } else {
            logger.debug({file: file, method: 'SQL', call: call});
        }
    }

    if(error) {
        console.log('error:'); console.log(call); console.log(error);

        logger.error({error: error, file: file, method: 'SQL', call: call});
    }
};

module.exports.logError = function(file, error, method) {
    file = file || 'unknown';
    method = method || 'DEFAULT';

    logger.error({error: error, file: file, method: method});
};