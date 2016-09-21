var api = require('./../bootstrap'),
    r = require('./../random'),
    _ = require('underscore');

var chai = require('chai'),
    should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var testPOST = {
    person_id: 1,
    protection_id: 1,
    protectionquality_id: 1
};

var verifyData = function(data) {
    should.exist(data);

    _.each(data, function(item) {
        should.exist(item.id);
        should.exist(item.name);
        should.exist(item.description);
        should.exist(item.price);
        should.exist(item.protectiontype_id);
        should.exist(item.protectiontype_name);
        should.exist(item.attribute_id);
        should.exist(item.attribute_name);
        should.exist(item.attribute_value);
        should.exist(item.bodypart_id);
        should.exist(item.bodypart_name);
        should.exist(item.quality_id);
        should.exist(item.quality_name);
        should.exist(item.quality_price);
        should.exist(item.quality_attribute_value);
    });
};

describe('Person has Protection', function() {

    it('should successfully POST new row', function(done) {
        api('/person-protection', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows for person', function(done) {
        api('/person-protection/id/' + testPOST.person_id)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

});