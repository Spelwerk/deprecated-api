// Load module
var mysql = require('mysql');

// Load configuration
var config = require('./config').pool;

// Initialize pool
var pool = mysql.createPool(config);

module.exports = pool;