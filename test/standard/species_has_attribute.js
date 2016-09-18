var api = require('./../bootstrap'),
    r = require('./../random'),
    _ = require('underscore');

var chai = require('chai'),
    should = chai.should(),
    assert = chai.assert,
    expect = chai.expect;

var testPOST = {
    species_id: 1,
    attribute_id: 1,
    value: r.rINT(1,10)
};

var testPUT = {
    species_id: 1,
    attribute_id: 1,
    value: r.rINT(1,10)
};

describe('Species has Attribute', function() {

    var verifyData = function(data) {
        should.exist(data);

        _.each(data, function(item) {
            should.exist(item.species_id);
            should.exist(item.species_name);
            should.exist(item.attribute_id);
            should.exist(item.attribute_name);
            should.exist(item.value);
        });
    };

    it('should successfully POST new row', function(done) {
        api('/species-attribute', testPOST)
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully PUT new row', function(done) {
        api('/species-attribute', testPUT, 'put')
            .expect(201)
            .end(function(error, response) {
                assert.ifError(error);
                should.exist(response.body.success);

                done();
            });
    });

    it('should successfully GET all rows for species', function(done) {
        api('/species-attribute/id/'+testPUT.species_id)
            .expect(200)
            .end(function(error, response) {
                assert.ifError(error);
                verifyData(response.body.success);

                done();
            });
    });

});