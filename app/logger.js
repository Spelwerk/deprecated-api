var winston = require('winston');

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

    if(error) {

        console.log(method);
        console.log(error);

        logger.error({error: error, file: file, method: 'SQL', call: call});
        logger.debug({error: error, file: file, method: 'SQL', call: call});
    } else {
        logger.debug({file: file, method: 'SQL', call: call});
    }
};

module.exports.logError = function(file, error, method) {
    file = file || 'unknown';
    method = method || 'DEFAULT';

    logger.error({error: error, file: file, method: method});
};