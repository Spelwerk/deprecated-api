var api = require('./../bootstrap'),
    r = require('./../random'),
    _ = require('underscore');

var chai = require('chai'),
    should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var testPOST = {
    person_id: 1,
    characteristic_id: 1
};

var verifyData = function(data) {
    should.exist(data);

    _.each(data, function(item) {
        should.exist(item.id);
        should.exist(item.name);
        should.exist(item.description);
        should.exist(item.gift);
        should.exist(item.species_id);
        should.exist(item.species_name);
        should.exist(item.manifestation_id);
        should.exist(item.manifestation_name);
        should.exist(item.attribute_id);
        should.exist(item.attribute_name);
        should.exist(item.attribute_value);
    });
};

describe('Person has Characteristic', function() {

    it('should successfully POST new row', function(done) {
        api('/person-characteristic', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows for person', function(done) {
        api('/person-characteristic/id/' + testPOST.person_id)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

});