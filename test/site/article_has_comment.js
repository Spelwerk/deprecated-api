var api = require('./../bootstrap'),
    r = require('./../random'),
    _ = require('underscore');

var chai = require('chai'),
    should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var testPOST = {
    article_id: 1,
    comment_id: 1
};

var verifyData = function(data) {
    should.exist(data);

    _.each(data, function(item) {
        should.exist(item.id);
        should.exist(item.content);
        should.exist(item.user_id);
        should.exist(item.user_username);
        should.exist(item.created);
    });
};

describe('Article has Comment', function() {

    it('should successfully POST new row', function(done) {
        api('/article-comment', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows for article', function(done) {
        api('/article-comment/id/' + testPOST.article_id)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

});