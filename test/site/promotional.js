var api = require('./../bootstrap'),
    r = require('./../random'),
    _ = require('underscore');

var chai = require('chai'),
    should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var testPOST = {
    title: r.rHEX(24),
    content: r.rHEX(24),
    start: r.rDATE(),
    end: r.rDATE(),
    user_id: 1
};

var testPUT = {
    title: r.rHEX(24),
    content: r.rHEX(24),
    start: r.rDATE(),
    end: r.rDATE(),
    user_id: 1
};

var insertedID;

var verifyData = function(data) {
    should.exist(data);

    _.each(data, function(item) {
        should.exist(item.id);
        should.exist(item.title);
        should.exist(item.content);
        should.exist(item.start);
        should.exist(item.end);
        should.exist(item.user_id);
        should.exist(item.user_username);
        should.exist(item.created);
    });
};

describe('Promotional', function() {

    it('should successfully POST new row', function(done) {
        api('/promotional', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                insertedID = response.body.id;

                done();
            });
    });

    it('should successfully PUT new row', function(done) {
        api('/promotional/id/' + insertedID, testPUT, 'put')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows', function(done) {
        api('/promotional')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

    it('should successfully GET latest row', function(done) {
        api('/promotional/id/' + insertedID)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

});