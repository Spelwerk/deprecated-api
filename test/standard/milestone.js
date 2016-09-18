var api = require('./../bootstrap'),
    r = require('./../random'),
    _ = require('underscore');

var chai = require('chai'),
    should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var testPOST = {
    name: r.rHEX(24),
    description: r.rHEX(64),
    upbringing: r.rBOOL(),
    caste_id: 1,
    manifestation_id: 1,
    attribute_id: 1,
    attribute_value: r.rINT(1,10),
    loyalty_id: 1
};

var testPUT = {
    name: r.rHEX(24),
    description: r.rHEX(64),
    upbringing: r.rBOOL(),
    caste_id: 1,
    manifestation_id: 1,
    attribute_id: 1,
    attribute_value: r.rINT(1,10),
    loyalty_id: 1
};

var insertedID;

var verifyData = function(data) {
    should.exist(data);

    _.each(data, function(item) {
        should.exist(item.id);
        should.exist(item.name);
        should.exist(item.description);
        should.exist(item.upbringing);
        should.exist(item.caste_id);
        should.exist(item.caste_name);
        should.exist(item.manifestation_id);
        should.exist(item.manifestation_name);
        should.exist(item.attribute_id);
        should.exist(item.attribute_name);
        should.exist(item.attribute_value);
        should.exist(item.loyalty_id);
        should.exist(item.loyalty_name);
        should.exist(item.created);
    });
};

describe('Milestone', function() {

    it('should successfully POST new row', function(done) {
        api('/milestone', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                insertedID = response.body.id;

                done();
            });
    });

    it('should successfully PUT new row', function(done) {
        api('/milestone/id/' + insertedID, testPUT, 'put')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows', function(done) {
        api('/milestone')
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

    it('should successfully GET latest row', function(done) {
        api('/milestone/id/' + insertedID)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

});