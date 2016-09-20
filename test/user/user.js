var api = require('./../bootstrap'),
    r = require('./../random'),
    _ = require('underscore');

var chai = require('chai'),
    should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var user = r.rHEX(12),
    pass = r.rHEX(12);

var testCREATE = {
    username: user,
    password: pass,
    email: r.rHEX(12) + '@' + r.rHEX(12) + '.com'
};

var testAUTH = {
    username: user,
    password: pass
};

var tokenCREATE,
    tokenAUTH;

var verifyData = function(data) {
    should.exist(data);

    _.each(data, function(item) {
        should.exist(item.id);
        should.exist(item.username);
        should.exist(item.email);
        should.exist(item.created);
    });
};

describe('User', function() {

    it('should successfully CREATE new user', function(done) {
        api('/user/create', testCREATE)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                tokenCREATE = response.body.success;

                done();
            });
    });

    it('should successfully AUTH user', function(done) {
        api('/user/auth', testAUTH)
            .expect(202)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                tokenAUTH = response.body.success;

                done();
            });
    });

    it('should successfully GET all users', function(done) {
        api('/user')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

    it('should successfully GET user token info from CREATE', function(done) {
        api('/user/info', tokenCREATE, 'token')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);

                should.exist(response.body.success.id);
                should.exist(response.body.success.username);
                should.exist(response.body.success.admin);

                done();
            });
    });

    it('should successfully GET user token info from AUTH', function(done) {
        api('/user/info', tokenAUTH, 'token')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);

                should.exist(response.body.success.id);
                should.exist(response.body.success.username);
                should.exist(response.body.success.admin);

                done();
            });
    });

});