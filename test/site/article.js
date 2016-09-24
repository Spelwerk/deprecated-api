var api = require('./../bootstrap'),
    r = require('./../random'),
    _ = require('underscore');

var chai = require('chai'),
    should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var testPOST = {
    title: r.rHEX(24),
    abstract: r.rHEX(24),
    content: r.rHEX(24),
    published: 1,
    articletype_id: 1,
    user_id: 1
};

var testPUT = {
    title: r.rHEX(24),
    abstract: r.rHEX(24),
    content: r.rHEX(24),
    published: 1,
    articletype_id: 1,
    user_id: 1
};

var insertedID;

var verifyData = function(data) {
    should.exist(data);

    _.each(data, function(item) {
        should.exist(item.id);
        should.exist(item.title);
        should.exist(item.abstract);
        should.exist(item.content);
        should.exist(item.published);
        should.exist(item.articletype_id);
        should.exist(item.user_id);
        should.exist(item.created);
    });
};

describe('Article', function() {

    it('should successfully POST new row', function(done) {
        api('/article', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                insertedID = response.body.id;

                done();
            });
    });

    it('should successfully PUT new row', function(done) {
        api('/article/id/' + insertedID, testPUT, 'put')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows where deleted is null', function(done) {
        api('/article')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

    it('should successfully GET latest row', function(done) {
        api('/article/id/' + insertedID)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows for type and published', function(done) {
        api('/article/type/1/published/1')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

});