var mysql = require('mysql'),
    async = require('async'),
    logger = require('./../logger'),
    rest = require('./../rest'),
    hasher = require('./../hasher');

module.exports = function(router, table, path) {
    path = path || '/' + table;

    // todo get/post/put/delete
};