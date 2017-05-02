var async = require('async'),
    mysql = require('mysql'),
    rest = require('./../rest'),
    tokens = require('./../tokens');

module.exports = function(pool, router, table, path) {
    path = path || '/' + table;

    var query = 'SELECT * FROM background_has_asset';

    router.get(path + '/id/:id', function(req, res) {
        var call = query + ' WHERE ' +
            'background_has_asset.background_id = ?';

        rest.QUERY(pool, req, res, call, [req.params.id], {"asset_id": "ASC"});
    });

    router.post(path + '/id/:id/asset', function(req, res) {
        var table = {},
            insert = {},
            user = {};

        table.id = req.params.id;

        insert.id = parseInt(req.body.insert_id);
        insert.amount = parseInt(req.body.amount);

        user.token = tokens.decode(req);
        user.id = user.token.sub.id;
        user.admin = user.token.sub.admin;

        if(!user.token) {
            res.status(400).send('User not logged in.');
        } else {
            async.series([
                function(callback) {
                    query(pool,'SELECT owner FROM user_has_background WHERE user_id = ? AND background_id = ?',[user.id,table.id],function(err,result) {
                        user.owner = !!result[0];

                        callback(err);
                    });
                },
                function(callback) {
                    if(!user.admin && !user.owner) {
                        res.status(400).send('User not allowed to post to this table row.');
                    } else {
                        var call = 'INSERT INTO background_has_asset (background_id,asset_id,amount) VALUES (?,?,?)';

                        query(pool,call,[table.id,insert.id,insert.amount],callback);
                    }
                }
            ],function(err) {
                if(err) {
                    res.status(500).send(err);
                } else {
                    res.status(202).send();
                }
            });
        }
    });

    router.delete(path + '/id/:id/asset/:id2', function(req, res) {
        rest.relationDelete(pool, req, res, 'background', 'asset');
    });
};