var api = require('./../bootstrap'),
    r = require('./../random'),
    _ = require('underscore');

var chai = require('chai'),
    should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var testPOST = {
    story_id: 1,
    person_id: 1,
    person_hash: r.rHEX(20)
};

var testPUT = {
    story_id: 1,
    person_id: 1,
    person_hash: r.rHEX(20)
};

var verifyData = function(data) {
    should.exist(data);

    _.each(data, function(item) {
        should.exist(item.id);
        should.exist(item.hash);
        should.exist(item.nickname);
        should.exist(item.surname);
        should.exist(item.occupation);
        should.exist(item.description);
    });
};

describe('Story has Person', function() {

    it('should successfully POST new row', function(done) {
        api('/story-person', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully PUT new row', function(done) {
        api('/story-person', testPUT, 'put')
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows for story', function(done) {
        api('/story-person/id/'+testPUT.story_id)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

});