var api = require('./../bootstrap'),
    r = require('./../random'),
    _ = require('underscore');

var chai = require('chai'),
    should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var testPOST = {
    person_id: 1,
    expertise_id: 1,
    level: r.rINT(1,4)
};

var verifyData = function(data) {
    should.exist(data);

    _.each(data, function(item) {
        should.exist(item.id);
        should.exist(item.name);
        should.exist(item.level);
        should.exist(item.description);
        should.exist(item.maximum);
        should.exist(item.hidden);
        should.exist(item.expertisetype_id);
        should.exist(item.expertisetype_name);
        should.exist(item.skill_attribute_id);
        should.exist(item.skill_attribute_name);
        should.exist(item.give_attribute_id);
        should.exist(item.give_attribute_name);
    });
};

describe('Person has Expertise', function() {

    it('should successfully POST new row', function(done) {
        api('/person-expertise', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully PUT existing row', function(done) {
        api('/person-expertise', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows for person with type', function(done) {
        api('/person-expertise/id/' + testPOST.person_id + '/type/1')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

});